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
    .map(action => summarizeAction(action, fightInfos))
    .join('\n')

  result += '\n\n End of Round #' + (idx+1)
  return result;
}

function summarizeTeam(team, fighterName) {
  const fighter = team[0]
  return `Status **${fighterName}**: ${Math.round(Math.max(fighter.hp, 0) * 10) / 10}❤️\n`
}

function summarizeAction(action, fightInfos) {
  const attacker = action.attacker;
  const defender = action.defender;

  let summary = '';

  summary += `${attacker.id} attacks ${defender.id} first!\n\n`

  for (const attack of action.attacks) {
    summary += formatAttack(attack, attacker.id, defender.id)
  }

  return formatComment(summary, fightInfos)

}

function formatAttack(attack, attackerId, defenderId) {
  let attackSummary = '';
  switch (attack.hand) {
    case 'Main':
      attackSummary = `${attackerId} tries to attack ${defenderId} with main hand for ${attack.damage} damage`
      break;
    case 'Off':
      attackSummary = `${attackerId} tries to attack ${defenderId} with off hand for ${attack.damage} damage`
      break;
    case 'Both':
      attackSummary = `${attackerId} tries to attack ${defenderId} with both hands for ${attack.damage} damage`
      break;
    case 'None':
      attackSummary = `${attackerId} tries to attack ${defenderId} with no hand for ${attack.damage} damage`
      break;
    default:
      attackSummary = `[MISSING attack.hand: ${attack.hand}]`
  }

  attackSummary += attack.miss ? 'successfully.' : 'but misses.';

  return attackSummary;
}

function formatComment(comment, fightInfos) {
  return comment.replace(fightInfos.soulA, `**${fightInfos.soulAMetadata.retrievedMetadata.name}**`)
    .replace(fightInfos.soulB, `**${fightInfos.soulBMetadata.retrievedMetadata.name}**`)
    .replace(fightInfos.fighterA, `**${fightInfos.fighterAName}**`)
    .replace(fightInfos.fighterB, `**${fightInfos.fighterBName}**`)
}