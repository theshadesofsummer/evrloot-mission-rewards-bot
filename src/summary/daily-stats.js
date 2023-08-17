module.exports = {
    getStats,
    resetStats,
    addToStats,
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
    stats.clear();
    missionCounter = 0;
}

function addToStats(reward) {
    const name = reward.retrievedMetadata.name;
    if (stats.has(name)) {
        const statEntry = stats.get(name);
        statEntry.amount += reward.amount;
        stats.set(name, statEntry)
    } else {
        stats.set(
          name,
            {
                rarity: reward.retrievedMetadata.attributes.find(attr => attr.label === 'Rarity').value,
                amount: reward.amount
            }
        )
    }
}


function increaseMissionCounter() {
    missionCounter++;
}