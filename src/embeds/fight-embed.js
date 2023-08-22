const removeIpfsStuff = require("../ipfs-link-tools");

module.exports = function createFightEmbed(fight, fightResult) {
  return {
    color: 0xae1917,
    title: `New Fight on the Trakanian Battlefield!`,
    fields: [
      {
        name: 'Team A',
        value: fight.fighterA,
        inline: true
      },
      {
        name: '',
        value: '⚔️',
        inline: true
      },
      {
        name: 'Team B',
        value: fight.fighterB,
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

function getFightResult(fight, fightResult) {
  let result = '';
  const winnerTeam = fightResult[0].winner;
  if (winnerTeam === 'Team A') {
    result += `*Winner*: **${fight.fighterA}**\n`
  } else {
    result += `*Winner*: **${fight.fighterB}**\n`
  }
  result += '*Combat Rounds*: ' + fightResult[0].combatRounds.length

  return result
}