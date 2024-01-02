

module.exports = function createPersonalStandingsEmbed(ownSoulsWithIndex) {
  return {
    color: 0xae1917,
    title: `⚔️ Personal souls on the leaderboard (must have won at least one game) ⚔️`,
    fields: [
      {
        name: 'Your warriors:',
        value: listEntries(ownSoulsWithIndex)
      }
    ],
    timestamp: new Date().toISOString(),
  };
}

function listEntries(ownSoulsWithIndex) {
  if (ownSoulsWithIndex.length === 0) {
    return 'None of your souls have won yet, you may need to set your foot in the arena with your mightiest warrior!'
  }

  let result = '';
  ownSoulsWithIndex.forEach(soulWithIndex => {
    result += `${soulWithIndex.index + 1}: **${soulWithIndex.entry.soulName}**: ${soulWithIndex.entry.amount} 🏆 (${soulWithIndex.entry.soulId})\n`
  })
  return result
}
