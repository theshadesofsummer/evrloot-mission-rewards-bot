const fs = require("fs");

module.exports = {
    getStats,
    resetStats,
    addToStats,
    increaseMissionCounter,
    increaseExpeditionCounter,
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
let expeditionCounter = 0;

function initStats() {
    console.log('init stats')
    let statsMapAsArray = []
    try {
        const savedStats = fs.readFileSync('./stats.json', 'utf8')
        const savedStatsJson = JSON.parse(savedStats);
        if (savedStatsJson['stats'])
            statsMapAsArray = savedStatsJson['stats'];
        if (savedStatsJson['missionCounter'])
            missionCounter = savedStatsJson['missionCounter'];
        if (savedStatsJson['expeditionCounter'])
            missionCounter = savedStatsJson['expeditionCounter'];
    } catch (err) {
        console.warn('could not load init map', err)
    }
    stats = new Map(statsMapAsArray)
}

function getStats() {
    return {
        stats: stats,
        missionCounter,
        expeditionCounter
    };
}

function resetStats() {
    stats.clear();
    missionCounter = 0;
    expeditionCounter = 0;
    fs.writeFileSync('./stats.json', JSON.stringify({expeditionCounter, missionCounter, stats: [...stats]}) , 'utf-8');
}

function addToStats(reward) {
    let name = ''
    if (reward.pinkExclusiveName) {
        name = reward.pinkExclusiveName
    } else {
        name = reward.retrievedMetadata.name
    }
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
    fs.writeFileSync('./stats.json', JSON.stringify({expeditionCounter, missionCounter, stats: [...stats]}) , 'utf-8');
}


function increaseMissionCounter() {
    missionCounter++;
    fs.writeFileSync('./stats.json', JSON.stringify({expeditionCounter, missionCounter, stats: [...stats]}) , 'utf-8');
}

function increaseExpeditionCounter() {
    expeditionCounter++;
    fs.writeFileSync('./stats.json', JSON.stringify({expeditionCounter, missionCounter, stats: [...stats]}) , 'utf-8');
}