const { getStats, resetStats } = require('./daily-stats')

module.exports = function generateSummary() {
    const {stats, missionCounter} = getStats();
    
    if (stats.size <= 0) {
        return '`No items gathered in the last 24 hours`'
    }

    let summary = '```ansi\n' +
        `Missions claimed: \u001b[4;36m${missionCounter}\u001b[0m\n\n` +
        'Gathered in the last 24 hours:\n';
    for (const [itemName, value] of stats) {
        const rarityColor = getColorRarity(value.rarity)
        summary += `${rarityColor}${itemName}\u001b[0m: ${value.amount}\n`
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