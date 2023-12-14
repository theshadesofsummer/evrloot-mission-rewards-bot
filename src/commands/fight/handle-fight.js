const {getFightByFightId, deleteFight, saveFightResult, addSoulCooldown, updateWinnerOnLeaderboard} = require("../../evrloot-db");
const {startFight, getSoulMetadata, mapMetadataToSoul} = require("../../evrloot-api");
const createFightEmbed = require('../../embeds/fight-embed')
const {postFightResult, mapClientIdToName} = require("../../discord-client");
const {ThreadAutoArchiveDuration} = require("discord-api-types/v10");
const createFighterEmbed = require('../../embeds/fighter-embed')

const ONE_HOUR = 3600;

module.exports = async function (interaction, fightId) {
  const fight = await getFightByFightId(fightId);

  const fightResult = await startFight(fight.soulA, fight.soulB)
  await saveFightResult(fightResult)
  await saveSoulCooldowns(fight, fightResult[0].winner)
  await saveWinnerToLeaderboard(fight, fightResult[0].winner)

  await deleteFight(fightId)

  const fightMessage = await postFightResult(createFightEmbed(fight, fightResult[0]))

  const fighterNames = await mapClientIdToName([fight.fighterA, fight.fighterB]);
  const soulAMetadata = await getSoulMetadata(fight.soulA);
  const soulBMetadata = await getSoulMetadata(fight.soulB);

  const fightInfos = {
    ...fight,
    fighterAName: fighterNames[0],
    fighterBName: fighterNames[1],
    soulAMetadata,
    soulBMetadata
  }

  const fightThread = await fightMessage.startThread({
    name: `${fighterNames[0]} vs. ${fighterNames[1]}`,
    autoArchiveDuration: ThreadAutoArchiveDuration.OneHour
  })

  sendCombatRounds(fightThread, fightResult[0].combatRounds, fightInfos)
}

async function saveSoulCooldowns(fight, winner) {
  const soulAId = fight.soulA;
  const soulBId = fight.soulB;
  const currentTimestamp = Math.round(Date.now() / 1000)

  if (winner === 'Team A') {
    await addSoulCooldown(soulAId, currentTimestamp + ONE_HOUR * 6)
    await addSoulCooldown(soulBId, currentTimestamp + ONE_HOUR * 24)
  } else if (winner === 'Team B') {
    await addSoulCooldown(soulAId, currentTimestamp + ONE_HOUR * 24)
    await addSoulCooldown(soulBId, currentTimestamp + ONE_HOUR * 6)
  } else {
    console.log('saveSoulCooldowns, no matching winner team found:', winner)
  }
}

async function saveWinnerToLeaderboard(fight, winner) {
  if (winner === 'Team A') {
    await updateWinnerOnLeaderboard(fight.fighterA)
  } else if (winner === 'Team B') {
    await updateWinnerOnLeaderboard(fight.fighterB)
  } else {
    console.log('saveWinnerToLeaderboard, no matching winner team found:', winner)
  }
}

function sendCombatRounds(fightThread, combatRounds, fightInfos) {
  fightThread.send({
    content: `# Fight Overview`,
    embeds: [
      createFighterEmbed(fightInfos.fighterA, fightInfos.soulAMetadata),
      createFighterEmbed(fightInfos.fighterB, fightInfos.soulBMetadata)
    ]
  })
  combatRounds.forEach((round, idx) => fightThread.send(summarizeRound(round, idx, fightInfos)))
}

function summarizeRound(round, idx, fightInfos) {
  let result = '## Round #' + (idx+1) + '\n\n';

  result += summarizeTeam(round.teamA, fightInfos.fighterAName)
  result += summarizeTeam(round.teamB, fightInfos.fighterBName)

  result += '\n'

  result += Object.values(round.battleActions)
    .map((action, idx) => summarizeAction(action, idx, fightInfos))
    .join('\n')

  result += '\n\n End of Round #' + (idx+1)
  return result;
}

function summarizeTeam(team, fighterName) {
  const fighter = team[0]
  return `Status **${fighterName}**: ${formatHealth(fighter.hp)}\n`
}

function summarizeAction(action, idx, fightInfos) {
  const attackerId = action.attacker.id;
  const defenderId = action.defender.id;

  let summary = '';

  if (idx === 0) summary += `${attackerId} attacks ${defenderId} first!\n\n`
  for (const attack of action.attacks.entries()) {
    summary += formatAttack(attack, attackerId, defenderId)
  }

  summary += '\n' + healthChange(action)

  return formatComment(summary, fightInfos)

}

function formatAttack(attack, attackerId, defenderId) {
  let attackSummary = '';
  switch (attack.hand) {
    case 'Main':
      attackSummary = `${attackerId} tries to attack ${defenderId} with main hand for ${attack.damage} damage `
      break;
    case 'Off':
      attackSummary = `${attackerId} tries to attack ${defenderId} with off hand for ${attack.damage} damage `
      break;
    case 'Both':
      attackSummary = `${attackerId} tries to attack ${defenderId} with both hands for ${attack.damage} damage `
      break;
    case 'None':
      attackSummary = `${attackerId} tries to attack ${defenderId} with no hand for ${attack.damage} damage `
      break;
    default:
      attackSummary = `[MISSING attack.hand: ${attack.hand}] `
  }

  attackSummary += attack.miss ? 'successfully.' : 'but misses.';
  attackSummary += '\n'
  return attackSummary;
}

function healthChange(attack) {
  return `Attacker ${attack.attacker.id}: ${formatHealth(attack.attacker.hp.starting)} ➡ ${formatHealth(attack.attacker.hp.ending)}\n`
    + `Defender ${attack.defender.id}: ${formatHealth(attack.defender.hp.starting)} ➡ ${formatHealth(attack.defender.hp.ending)}\n`
}

function formatComment(comment, fightInfos) {
  console.log('>>>', typeof fightInfos.soulA, typeof fightInfos.soulB, typeof comment)
  return comment
    .replace(fightInfos.soulA, `**${fightInfos.soulAMetadata.retrievedMetadata.name}**`)
    .replace(fightInfos.soulB, `**${fightInfos.soulBMetadata.retrievedMetadata.name}**`)
    .replace(fightInfos.fighterA, `**${fightInfos.fighterAName}**`)
    .replace(fightInfos.fighterB, `**${fightInfos.fighterBName}**`)
}

function formatHealth(hp) {
  return `${Math.round(hp * 100) / 100}❤️`
}