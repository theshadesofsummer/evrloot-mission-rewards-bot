const removeIpfsStuff = require("../helpers/ipfs-link-tools");

module.exports = function createFightEmbed(fight, fightResult) {
  return {
    color: 0xae1917,
    title: `New Fight on the Trakanian Battlefield!`,
    fields: [
      {
        name: 'Team A',
        value: getTeamInfo(fight, fightResult.finalState, true),
        inline: true
      },
      {
        name: '',
        value: '⚔️',
        inline: true
      },
      {
        name: 'Team B',
        value: getTeamInfo(fight, fightResult.finalState, false),
        inline: true
      },
      {
        name: 'Result',
        value: getFightResult(fight, fightResult),
      }
    ],
    timestamp: new Date().toISOString(),
  };
}

function getTeamInfo(fight, finalState, teamA) {
  let result = '';
  result += teamA ? `<@${fight.fighterA}>` : `<@${fight.fighterB}>`;
  result += '\n'
  result += getFinalState(teamA ? finalState.teamAFinal : finalState.teamBFinal)
  return result
}

function getFinalState(finalTeamMembers) {
  return finalTeamMembers
    .map(stateOfSoul)
    .join('\n')
}
function stateOfSoul(soulState, index) {
  return `[${index+1}] ${Math.round(Math.max(soulState.finalHp, 0) * 10) / 10}❤️ ` +
    `${Math.round(Math.max(soulState.finalArmor, 0) * 10) / 10}🛡️ ` +
    `${Math.round(Math.max(soulState.finalInitiative, 0) * 10) / 10}⚡ `
}
function getFightResult(fight, fightResult) {
  let result = '';
  const winnerTeam = fightResult.winner;
  if (winnerTeam === 'Team A') {
    result += `*Winner*: <@${fight.fighterA}>\n`
    result += '*Combat Rounds*: ' + fightResult.combatRounds.length + '\n\n'
    result += `<@${fight.fighterA}>'s soul got a cooldown for 6h\n`
    result += `<@${fight.fighterB}>'s soul got a cooldown for 24h`
  } else {
    result += `*Winner*: <@${fight.fighterB}>\n`
    result += '*Combat Rounds*: ' + fightResult.combatRounds.length + '\n\n'
    result += `<@${fight.fighterB}>'s soul got a cooldown for 6h\n`
    result += `<@${fight.fighterA}>'s soul got a cooldown for 24h`
  }
  return result
}