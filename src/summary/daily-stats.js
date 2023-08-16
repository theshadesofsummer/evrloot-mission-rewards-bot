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
    console.log('cleared stats')
    stats.clear();
    missionCounter = 0;
}

function addToStats(reward) {
    const name = reward.metadata.name;
    if (stats.has(name)) {
        const statEntry = stats.get(name);
        statEntry.amount += 1;
        stats.set(name, statEntry)
    } else {
        stats.set(
          name,
            {
                rarity: reward.metadata.attributes.find(attr => attr.label === 'Rarity').value,
                amount: reward.amount
            }
        )
    }
    console.log(stats)
}


function increaseMissionCounter() {
    missionCounter++;
}