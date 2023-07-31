module.exports = {
    getStats,
    resetStats,
    addItemToStats,
    addResourceToStats,
    increaseMissionCounter
}

const stats = new Map();
// <
//   key: string, 
//   val: {
//     rarity: string,
//     amount: number
//   }
// >
let missionCounter = 0;

function getStats() {
    return {
        stats: stats,
        missionCounter: missionCounter
    };
}

function resetStats() {
    console.log('cleared stats')
    stats.clear();
    missionCounter = 0;
}

function addItemToStats(metadata) {
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
    console.log('stats after added item:', stats)
}

function addResourceToStats(metadata, amount) {
    const itemName = metadata.name;
    if (stats.has(itemName)) {
        const statEntry = stats.get(metadata.name);
        statEntry.amount += amount;
        stats.set(itemName, statEntry)
    } else {
        stats.set(
            metadata.name,
            {
                rarity: metadata.attributes.find(attr => attr.label === 'Rarity').value,
                amount: amount
            }
        )
    }
}

function increaseMissionCounter() {
    missionCounter++;
}