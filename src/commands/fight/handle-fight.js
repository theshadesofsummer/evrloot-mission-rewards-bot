const {getFightByFightId, deleteFight, addSoulCooldown, updateWinnerOnLeaderboard, addFightParticipants,
  countPlayerCombination
} = require("../../evrloot-db");
const {startFight} = require("../../evrloot-api");
const createFightEmbed = require('../../embeds/fight-embed')
const {postFightResult, mapClientIdToName} = require("../../discord-client");
const {ThreadAutoArchiveDuration} = require("discord-api-types/v10");
const createFighterEmbed = require('../../embeds/fighter-embed')

const ONE_HOUR = 3600;

module.exports = async function (fightId) {
  const fightInfos = await getFightByFightId(fightId);

  console.log('>>> fightInfos:', fightInfos)

  const fightResult = await startFight(fightInfos.soulA, fightInfos.soulB);

  await deleteFight(fightId);

  const fight = await addDiscordUserToFighters(fightResult[0], fightInfos.fighterA, fightInfos.fighterB);
  const winnerPoints = calculateWinnerPoints(fight);
  await saveSoulCooldowns(fight);
  await saveWinnerToLeaderboard(fight, winnerPoints);
  await countPlayerCombination(fightInfos.fighterA, fightInfos.fighterB)

  await addFightParticipants(fight.teamA.discordId);
  await addFightParticipants(fight.teamB.discordId);

  const fightMessage = await postFightResult(createFightEmbed(fight, winnerPoints))
  const fightThread = await fightMessage.startThread({
    name: `${fight.teamA.discordName} vs. ${fight.teamB.discordName}`,
    autoArchiveDuration: ThreadAutoArchiveDuration.OneHour
  })
  await sendCombatRounds(fightThread, fight)
}

async function addDiscordUserToFighters(fightResult, discordIdA, discordIdB) {
  const fighterA = fightResult.teamA[0];
  const fighterB = fightResult.teamB[0];

  const fighterNames = await mapClientIdToName([discordIdA, discordIdB]);

  fighterA.discordId = discordIdA;
  fighterA.discordName = fighterNames[0];
  fighterB.discordId = discordIdB;
  fighterB.discordName = fighterNames[1];

  return {...fightResult, teamA: fighterA, teamB: fighterB}
}

async function saveSoulCooldowns(fight) {
  const soulAId = fight.teamA.id;
  const soulBId = fight.teamB.id;
  const currentTimestamp = Math.round(Date.now() / 1000)

  const winner = fight.winner;
  if (winner === 'Team A') {
    await addSoulCooldown(soulAId, currentTimestamp + ONE_HOUR * 6)
    await addSoulCooldown(soulBId, currentTimestamp + ONE_HOUR * 10)
  } else if (winner === 'Team B') {
    await addSoulCooldown(soulAId, currentTimestamp + ONE_HOUR * 10)
    await addSoulCooldown(soulBId, currentTimestamp + ONE_HOUR * 6)
  } else {
    console.log('saveSoulCooldowns, no matching winner team found:', winner)
  }
}

function calculateWinnerPoints(fight) {
  const winner = fight.winner;
  if (winner === 'Team A') {
    return getWinnerPointsFor(fight.teamA)
  } else if (winner === 'Team B') {
    return getWinnerPointsFor(fight.teamB)
  }
}

const importantSlots = ["Head", "Body", "Feet", "Main Hand", "Off Hand"]
function getWinnerPointsFor(soul) {
  let winningPoints = 2.0; //leg = -0.2; 2*epic = -0.2

  let epicCounter = 0;

  const importantSoulChildren = soul.nft.children
    .filter(childNft => importantSlots.includes(childNft.retrievedMetadata.properties["Slot"].value));

  for (const child of importantSoulChildren) {
    const childRarity = child.retrievedMetadata.properties["Rarity"].value
    if (childRarity === 'Legendary') winningPoints -= 0.2;
    if (childRarity === 'Epic') epicCounter += 1
  }

  let epicReduction = epicCounter / 2;
  if (epicReduction >= 1) {
    winningPoints = winningPoints - (Math.floor(epicReduction) * 0.2)
  }

  return winningPoints;
}
async function saveWinnerToLeaderboard(fight, winPoints) {
  const winner = fight.winner;

  if (winner === 'Team A') {
    await updateWinnerOnLeaderboard(fight.teamA.id, fight.teamA.metadata.name, winPoints)
  } else if (winner === 'Team B') {
    await updateWinnerOnLeaderboard(fight.teamB.id, fight.teamB.metadata.name, winPoints)
  } else {
    console.log('saveWinnerToLeaderboard, no matching winner team found:', winner, winPoints)
  }
}

async function sendCombatRounds(fightThread, fight) {
  fightThread.send({
    content: `# Fight Overview`,
    embeds: [
      await createFighterEmbed(fight.teamA),
      await createFighterEmbed(fight.teamB)
    ]
  })
  fight.combatRounds.forEach((round, idx) => fightThread.send(summarizeRound(round, idx, fight)))
}

function summarizeRound(round, idx, fight) {
  let result = '## Round #' + (idx+1) + '\n\n';

  result += summarizeTeam(round.teamA, fight.teamA.discordName)
  result += summarizeTeam(round.teamB, fight.teamB.discordName)

  result += '\n'

  result += Object.values(round.battleActions)
    .map((action, idxOfBattleActions) => summarizeAction(action, idxOfBattleActions))
    .join('\n')

  result += '\n\n---End of Round #' + (idx+1) + '---'
  return formatComment(result, fight);
}

function summarizeTeam(team, fighterName) {
  const fighter = team[0]
  return `Status **${fighterName}**: ${formatHealth(fighter.hp)}\n`
}

function summarizeAction(action, idxOfBattleActions) {
  const attackerId = action.attackers[0].id;
  const defenderId = action.defenders[0].id;

  let summary = '';

  if (idxOfBattleActions === 0) summary += `⚡ ${attackerId} attacks ${defenderId} first!\n\n`
  for (const attack of action.attacks) {
    summary += formatAttack(attack, attackerId, defenderId)
  }

  summary += '\n' + healthChange(action)

  return summary

}

function formatAttack(attack, attackerId, defenderId) {
  let attackSummary = '';

  if (attack.special) {
    switch (attack.special) {
      case 'Ranger_Guarenteed_Critical':
        attackSummary += `✨ The ranger ${attackerId} has a guaranteed critical Hit!\n`
        break;
      case 'Alchemist_Bomb':
        attackSummary += `✨ The alchemist ${attackerId} uses his bomb which deals ${attack.damage} AOE damage!\n`
        break;
      case 'Alchemist_Counter_Attack':
        attackSummary += `✨ The alchemist ${attackerId} counter attacks with ${attack["stats"].counterAttackDamage} damage!\n`
        break;
    }
  }

  if (!attack.aoe && !(attack.special === `Alchemist_Counter_Attack`)) {
    if (attack.critical) attackSummary += `💥 ${attackerId} lands a critical hit, the damage will be multiplied by ${attack["stats"].criticalMultiplier}\n`

    attackSummary += '⚔️ ';
    switch (attack.hand) {
      case 'Main':
        attackSummary += `${attackerId} tries to attack ${defenderId} with main hand for ${attack.damage} damage `
        break;
      case 'Off':
        attackSummary += `${attackerId} tries to attack ${defenderId} with off hand for ${attack.damage} damage `
        break;
      case 'Both':
        attackSummary += `${attackerId} tries to attack ${defenderId} with both hands for ${attack.damage} damage `
        break;
      case 'None':
        attackSummary += `${attackerId} tries to attack ${defenderId} with no hand for ${attack.damage} damage `
        break;
      default:
        attackSummary = `[MISSING attack.hand: ${attack.hand}] `
    }

    attackSummary += attack.miss ? 'but misses.' : 'successfully.';
    attackSummary += '\n'

    if (attack.dodge) attackSummary += `<:ability_dodge:1192521482530734201> ${defenderId} dodges the attack\n`
  }

  if (attack["stats"].lifestealHeal && attack["stats"].lifestealPercent) {
    attackSummary += `${attackerId} heals ${attack["stats"].lifestealHeal}❤️ with ${attack["stats"].lifestealPercent}% Lifesteal\n`
  }

  return attackSummary;
}

function healthChange(attack) {
  return `Attacker ${attack.attackers[0].id}: ${formatHealth(attack.attackers[0].hp.starting)} ➡ ${formatHealth(attack.attackers[0].hp.ending)}\n`
    + `Defender ${attack.defenders[0].id}: ${formatHealth(attack.defenders[0].hp.starting)} ➡ ${formatHealth(attack.defenders[0].hp.ending)}\n`
}

function formatComment(comment, fight) {
  return comment
    .replaceAll(fight.teamA.id, `**${fight.teamA.metadata.name}**`)
    .replaceAll(fight.teamB.id, `**${fight.teamB.metadata.name}**`)
    .replaceAll(fight.teamA.discordId, `**${fight.teamA.discordName}**`)
    .replaceAll(fight.teamB.discordId, `**${fight.teamB.discordName}**`)
}

function formatHealth(hp) {
  return `${Math.round(hp * 100) / 100}❤️`
}