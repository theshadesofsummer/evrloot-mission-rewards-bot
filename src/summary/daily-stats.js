const fs = require("fs");

module.exports = {
    getStats,
    resetStats,
    addToStats,
    increaseMissionCounter,
    initStats,
}

let stats = new Map();
// <
//   key: string, 
//   val: {
//     rarity: string,
//     amount: number
//   }
// >
let missionCounter = 0;

function initStats() {
    console.log('init stats')
    let statsMapAsArray = []
    try {
        const oldItems = fs.readFileSync('./stats.json', 'utf8')
        statsMapAsArray = JSON.parse(oldItems);
    } catch (err) {
        console.warn('could not load init map', err)
    }
    stats = new Map(statsMapAsArray)
}

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
    fs.writeFileSync('./stats.json', JSON.stringify([...stats]) , 'utf-8');
}


function increaseMissionCounter() {
    missionCounter++;
}