const {getFightByFightId, deleteFight, saveFightResult, addSoulCooldown, updateWinnerOnLeaderboard} = require("../../evrloot-db");
const {startFight} = require("../../evrloot-api");
const createFightEmbed = require('../../embeds/fight-embed')
const {postFightResult, mapClientIdToName} = require("../../discord-client");
const {ThreadAutoArchiveDuration} = require("discord-api-types/v10");

const ONE_HOUR = 3600;

module.exports = async function (interaction, fightId) {
  const fight = await getFightByFightId(fightId);

  const fightResult = await startFight(fight.soulA, fight.soulB)
  await saveFightResult(fightResult)
  await saveSoulCooldowns(fight, fightResult[0].winner)
  await saveWinnerToLeaderboard(fight, fightResult[0].winner)

  await deleteFight(fightId)

  const fightMessage = await postFightResult(createFightEmbed(fight, fightResult[0]))

  const fighters = await mapClientIdToName([fight.fighterA, fight.fighterB]);
  const fightThread = await fightMessage.startThread({
    name: `${fighters[0]} vs. ${fighters[1]}`,
    autoArchiveDuration: ThreadAutoArchiveDuration.OneHour
  })

  sendCombatRounds(fightThread, fightResult[0].combatRounds, fighters)
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

function sendCombatRounds(fightThread, combatRounds, fighters) {
  combatRounds.forEach((round, idx) => fightThread.send(summarizeRound(round, idx, fighters)))
}

function summarizeRound(round, idx, fighters) {
  let result = '## Round #' + (idx+1) + '\n\n';

  result += summarizeTeam(round.teamA, fighters[0])
  result += summarizeTeam(round.teamB, fighters[1])

  result += '\n'

  result += Object.values(round.battleActions)
    .map(action => summarizeAction(action, fighters))
    .join('\n')

  result += '\n\n End of Round #' + (idx+1)
  return result;
}

function summarizeTeam(team, fighterName) {
  const fighter = team[0]
  return `Status **${fighterName}**: ${Math.round(Math.max(fighter.hp, 0) * 10) / 10}❤️\n`
}

function summarizeAction(action, fighterNames) {
  switch (action.actionType) {
    case 'HIT':
      return `*[HIT]*: ${action.comment}`
    case 'ATTACK_CALCULATION':
      return `*[Calculating Attack Damage]* ${action.comment}*`
    case 'ATTACK_ROLL':
      return `*[Rolling Attack Damage]* ${action.comment}*`
    case 'DMG_REDUCTION':
      return `*[Defender's Armor]* ${action.comment}*`
    case 'ATTACK':
      return `*[ATTACK]*: ${action.comment}`
    case 'SPECIAL_EFFECTS':
      return `*[Special Effects]* ${action.comment}`
    default:
      'missing type ' + action.actionType
  }
}

function getUserFromFighter(soulId, fight) {
  switch (soulId) {
    case fight.soulA:
      return fight.fighterA
    case fight.soulB:
      return fight.fighterB
    default:
      console.log('could not find a matching user for', soulId, 'in', fight)
      return 'No Name'

  }
}