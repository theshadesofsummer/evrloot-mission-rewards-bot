

module.exports = function createLeaderboardEmbed(topTenEntries, isForMobile) {
  return {
    color: 0xae1917,
    title: `⚔️ Leaderboard on total winning points ⚔️`,
    description: 'The best warriors in Telcarna:',
    fields: isForMobile
      ? [
        {
          name: 'The best warriors in Telcarna:',
          value: listTopEntries(topTenEntries)
        }
      ]
      : [
        {
          name: 'Place:',
          value: listIndices(topTenEntries),
          inline: true
        },
          {
            name: 'Warriors:',
            value: listNames(topTenEntries),
            inline: true
          },
          {
            name: 'Points',
            value: listPoints(topTenEntries),
            inline: true
          }
        ],
    timestamp: new Date().toISOString(),
  };
}

function listIndices(topTenEntries) {
  if (topTenEntries.length === 0) {
    return 'No fighters have won yet, you better go fight you cowards!'
  }

  let topListMessage = '';
  topTenEntries.forEach((entry, index) => {
    switch (index) {
      case 0:
        topListMessage +=`🥇\n`
        break;
      case 1:
        topListMessage += `🥈\n`
        break;
      case 2:
        topListMessage += `🥉\n`
        break;
      default:
        topListMessage += `${index+1}:\n`
        break;
    }
  })
  return topListMessage
}

function listNames(topTenEntries) {
  if (topTenEntries.length === 0) {
    return 'No fighters have won yet, you better go fight you cowards!'
  }

  let topListMessage = '';
  topTenEntries.forEach((entry, index) => {
    topListMessage += `**${entry.soulName}**  (${entry.soulId})\n`
  })
  return topListMessage
}


function listPoints(topTenEntries) {
  if (topTenEntries.length === 0) {
    return '-'
  }

  let topListMessage = '';
  topTenEntries.forEach((entry, index) => {
    topListMessage += `${entry.amount} 🏆\n`
  })
  return topListMessage
}

function listTopEntries(topTenEntries) {
  if (topTenEntries.length === 0) {
    return 'No fighters have won yet, you better go fight you cowards!'
  }

  let topListMessage = '';
  topTenEntries.forEach((entry, index) => {
    switch (index) {
      case 0:
        topListMessage +=`🥇 **${entry.soulName}**: ${entry.amount} 🏆 (${entry.soulId})\n`
        break;
      case 1:
        topListMessage += `🥈 **${entry.soulName}**: ${entry.amount} 🏆 (${entry.soulId})\n`
        break;
      case 2:
        topListMessage += `🥉 **${entry.soulName}**: ${entry.amount} 🏆 (${entry.soulId})\n`
        break;
      default:
        topListMessage += `${index+1}: **${entry.soulName}**: ${entry.amount} 🏆 (${entry.soulId})\n`
        break;
    }
  })
  return topListMessage
}