const {getFightByFightId, deleteFight, saveFightResult} = require("../../evrloot-db");
const {startFight} = require("../../evrloot-api");
const createFightEmbed = require('../../embeds/fight-embed')
const {postFightResult} = require("../../discord-client");
const {ThreadAutoArchiveDuration} = require("discord-api-types/v10");

module.exports = async function (interaction, fightId) {
  const fight = await getFightByFightId(fightId);

  const fightResult = await startFight(fight.soulA, fight.soulB)

  saveFightResult(fightResult)

  const fightMessage = await postFightResult(createFightEmbed(fight, fightResult[0]))

  const fightThread = await fightMessage.startThread({
    name: `${fight.fighterA} vs. ${fight.fighterB}`,
    autoArchiveDuration: ThreadAutoArchiveDuration.OneHour
  })

  sendCombatRounds(fightThread, fightResult[0].combatRounds, fight)
}

function sendCombatRounds(fightThread, combatRounds, fight) {
  combatRounds.forEach((round, idx) => fightThread.send(summarizeRound(round, idx, fight)))
}

function summarizeRound(round, idx, fight) {
  let result = '## Round #' + (idx+1) + '\n\n';

  result += summarizeTeam(round.teamA, fight)
  result += summarizeTeam(round.teamB, fight)

  result += '\n'

  result += Object.values(round.battleActions)
    .map(action => summarizeAction(action, fight))
    .join('\n')

  result += '\n\n End of Round #' + (idx+1)
  return result;
}

function summarizeTeam(team, fight) {
  const fighter = team[0]
  return `Status **${getUserFromFighter(fighter.id, fight)}**: ${Math.round(Math.max(fighter.hp, 0) * 10) / 10}❤️\n`
}

function summarizeAction(action, fight) {
  switch (action.actionType) {
    case 'HIT':
      return `**${getUserFromFighter(action.attacker, fight)}**: ${action.comment}`
    case 'ATTACK_CALCULATION':
      return `*[Calculating Attack Damage]* ${action.comment}*`
    case 'ATTACK_ROLL':
      return `*[Rolling Attack Damage]* ${action.comment}*`
    case 'DMG_REDUCTION':
      return `*[Defender's Armor]* ${action.comment}*`
    case 'ATTACK':
      return `**${getUserFromFighter(action.attacker, fight)} attacks ${getUserFromFighter(action.defender, fight)}**: ${action.comment}`
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