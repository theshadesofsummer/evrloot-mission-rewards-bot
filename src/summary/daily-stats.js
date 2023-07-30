module.exports = {
    getStats,
    resetStats,
    addToStats
}

const stats = new Map();
// <
//   key: string, 
//   val: {
//     rarity: string,
//     amount: number
//   }
// >

function getStats() {
    return stats;
}

function resetStats() {
    stats.clear();
}

function addToStats(metadata) {
    const itemName = metadata.name;
    if (stats.has(itemName)) {
        const statEntry = stats.get(metadata.name);
        statEntry.amount += 1;
        stats.set(itemName, statEntry)
    } else {
        stats.set(
            metadata.name, 
            {
                rarity: metadata.attributes.find(attr => attr.label === 'Rarity').value,
                amount: 1
            }
        )
    }
}