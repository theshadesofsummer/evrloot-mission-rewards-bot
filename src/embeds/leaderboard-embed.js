

module.exports = function createLeaderboardEmbed(topTenEntries) {
  return {
    color: 0xae1917,
    title: `⚔️ Leaderboard on total fight wins ⚔️`,
    fields: [
      {
        name: 'The best warriors in Telcarna:',
        value: listTopEntries(topTenEntries)
      }
    ],
    timestamp: new Date().toISOString(),
  };
}

function listTopEntries(topTenEntries) {
  if (topTenEntries.length === 0) {
    return 'No fighters have won yet, you better go fight you cowards!'
  }

  let topListMessage = '';
  topTenEntries.forEach((entry, index) => {
    switch (index) {
      case 0:
        topListMessage +=`🥇 <@${entry.discordId}> (${entry.amount} 🏆)\n`
        break;
      case 1:
        topListMessage += `🥈 <@${entry.discordId}> (${entry.amount} 🏆)\n`
        break;
      case 2:
        topListMessage += `🥉 <@${entry.discordId}> (${entry.amount} 🏆)\n`
        break;
      default:
        topListMessage += `${index+1}: <@${entry.discordId}> (${entry.amount} 🏆)\n`
        break;
    }
  })
  return topListMessage
}

function listRest(lastSevenEntries) {
  let topListMessage = '';
  lastSevenEntries.forEach((leaderboardEntry, index) => topListMessage += `${index+4}: <@${leaderboardEntry[index].discordId}> (${leaderboardEntry[index].amount} 🏆)\n`)
  return topListMessage
}