
module.exports = function createFightEmbed(fight, winPoints) {
  return {
    color: 0xae1917,
    title: `New Fight on the Trakanian Battlefield!`,
    fields: [
      {
        name: 'Team A',
        value: getTeamInfo(fight, true),
        inline: true
      },
      {
        name: '',
        value: '⚔️',
        inline: true
      },
      {
        name: 'Team B',
        value: getTeamInfo(fight, false),
        inline: true
      },
      {
        name: 'Result',
        value: getFightResult(fight, winPoints),
      }
    ],
    timestamp: new Date().toISOString(),
  };
}

function getTeamInfo(fight, teamA) {
  let result = '';
  result += teamA ? `<@${fight.teamA.discordId}>` : `<@${fight.teamB.discordId}>`;
  result += '\n'
  result += getFinalState(teamA ? fight.finalState.teamA : fight.finalState.teamB)
  return result
}

function getFinalState(finalTeamMembers) {
  return finalTeamMembers
    .map(stateOfSoul)
    .join('\n')
}
function stateOfSoul(soulState, index) {
  return `[${index+1}] ${Math.round(Math.max(soulState.hp, 0) * 10) / 10}❤️ ` +
    `${Math.round(Math.max(soulState.armor, 0) * 10) / 10}🛡️ ` +
    `${Math.round(Math.max(soulState.initiative, 0) * 10) / 10}⚡ `
}
function getFightResult(fight, winPoints) {
  let result = '';

  const winnerTeam = fight.winner;
  if (winnerTeam === 'Team A') {
    result += `*Winner*: <@${fight.teamA.discordId}>'s soul ${fight.teamA.metadata.name} got ${winPoints} Points on the Leaderboard!\n`
    result += '*Combat Rounds*: ' + fight.combatRounds.length + '\n\n'
    result += `<@${fight.teamA.discordId}>'s soul got a cooldown for 6h\n`
    result += `<@${fight.teamB.discordId}>'s soul got a cooldown for 10h`
  } else {
    result += `*Winner*: <@${fight.teamB.discordId}>'s soul ${fight.teamA.metadata.name} got ${winPoints} Points on the Leaderboard!\n`
    result += '*Combat Rounds*: ' + fight.combatRounds.length + '\n\n'
    result += `<@${fight.teamB.discordId}>'s soul got a cooldown for 6h\n`
    result += `<@${fight.teamA.discordId}>'s soul got a cooldown for 10h`
  }

  return result
}