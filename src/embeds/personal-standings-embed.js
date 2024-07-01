

module.exports = function createPersonalStandingsEmbed(ownSoulsWithIndex) {
  return {
    color: 0xae1917,
    title: `⚔️ Personal souls on the leaderboard (must have participated in at least one battle) ⚔️`,
    fields: [
      {
        name: 'Place:',
        value: listIndices(ownSoulsWithIndex),
        inline: true
      },
      {
        name: 'Warriors:',
        value: listNames(ownSoulsWithIndex),
        inline: true
      },
      {
        name: 'Points',
        value: listPoints(ownSoulsWithIndex),
        inline: true
      },
    ],
    timestamp: new Date().toISOString(),
  };
}

function listIndices(ownSoulsWithIndex) {
  if (ownSoulsWithIndex.length === 0) {
    return '-'
  }

  let result = '';
  ownSoulsWithIndex.forEach(soulWithIndex => {
    result += `${soulWithIndex.index + 1}:\n`
  })
  return result
}

function listNames(ownSoulsWithIndex) {
  if (ownSoulsWithIndex.length === 0) {
    return '-'
  }

  let result = '';
  ownSoulsWithIndex.forEach(soulWithIndex => {
    result += `**${soulWithIndex.entry.soulName}** (${soulWithIndex.entry.soulId})\n`
  })
  return result
}

function listPoints(ownSoulsWithIndex) {
  if (ownSoulsWithIndex.length === 0) {
    return '-'
  }

  let result = '';
  ownSoulsWithIndex.forEach(soulWithIndex => {
    result += `${soulWithIndex.entry.amount} 🏆 (${soulWithIndex.entry.wins}W/${soulWithIndex.entry.losses}L) \n`
  })

  return result
}
