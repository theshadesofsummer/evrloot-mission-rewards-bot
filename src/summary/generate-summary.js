const { getStats, resetStats } = require('./daily-stats')

module.exports = function generateSummary() {
    const {stats, missionCounter} = getStats();
    
    if (stats.size <= 0) {
        return '`No items gathered in the last 24 hours`'
    }
    const allStats = Array.from(stats)
    const sortedStatsWithRarity =
      allStats.filter(hasSelectedRarity)
      .sort(raritySorter)

    let summary = '```ansi\n' +
        `Missions claimed: \u001b[4;36m${missionCounter}\u001b[0m\n\n` +
        'Gathered in the last 24 hours:\n';

    for (const [itemName, value] of sortedStatsWithRarity) {
        const rarityColor = getColorRarity(value.rarity)
        summary += `${rarityColor}${itemName}\u001b[0m: ${value.amount}\n`
    }

    const sortedStatsWithoutRarity =
      allStats.filter(item => !hasSelectedRarity(item))
    summary += `\nRewards with unrevealed Rarity:\n`

    for (const [itemName, value] of sortedStatsWithoutRarity) {
        summary += `\u001b[1;36m${itemName}\u001b[0m: ${value.amount}\n`
    }
    summary += '```'
    
    resetStats()

    return summary;
}

function getColorRarity(rarity) {
    if (rarity === 'Common') {
        return '\u001b[1;37m'
    } else if (rarity === 'Rare') {
        return '\u001b[1;34m'
    } else if (rarity === 'Epic') {
        return '\u001b[1;35m'
    } else if (rarity === 'Legendary') {
        return '\u001b[1;33m'
    }
    return 'error'
}

const raritySortValue = new Map([
    ['Common', 0],
    ['Rare', 1],
    ['Epic', 2],
    ['Legendary', 3],
])
function raritySorter(entryA, entryB) {
    const rarityA = entryA[1].rarity;
    const rarityB = entryB[1].rarity;

    return raritySortValue.get(rarityA) - raritySortValue.get(rarityB)
}

function hasSelectedRarity(entry) {
    const entryRarity = entry.rarity
    return ['Common', 'Rare', 'Epic', 'Legendary'].includes(entryRarity)
}