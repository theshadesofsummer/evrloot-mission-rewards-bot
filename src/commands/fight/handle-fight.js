const {getFightByFightId, deleteFight, addSoulCooldown, updateWinnerOnLeaderboard} = require("../../evrloot-db");
const {startFight} = require("../../evrloot-api");
const createFightEmbed = require('../../embeds/fight-embed')
const {postFightResult, mapClientIdToName} = require("../../discord-client");
const {ThreadAutoArchiveDuration} = require("discord-api-types/v10");
const createFighterEmbed = require('../../embeds/fighter-embed')

const ONE_HOUR = 3600;

module.exports = async function (interaction, fightId) {
  const fightInfos = await getFightByFightId(fightId);

  const fightResult = await startFight(fightInfos.soulA, fightInfos.soulB)

  const fight = await addDiscordUserToFighters(fightResult[0], fightInfos.fighterA, fightInfos.fighterB);

  console.log('new fight object', fight)

  await saveSoulCooldowns(fight)
  await saveWinnerToLeaderboard(fight)

  await deleteFight(fightId)

  const fightMessage = await postFightResult(createFightEmbed(fight))

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

async function saveWinnerToLeaderboard(fight) {
  const winner = fight.winner;
  if (winner === 'Team A') {
    await updateWinnerOnLeaderboard(fight.teamA.id)
  } else if (winner === 'Team B') {
    await updateWinnerOnLeaderboard(fight.teamB.id)
  } else {
    console.log('saveWinnerToLeaderboard, no matching winner team found:', winner)
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
  let attackSummary = '⚔️ ';
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