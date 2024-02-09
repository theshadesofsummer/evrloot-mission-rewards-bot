module.exports = {
  generateEvrmon
}

const TOTAL_POINTS_TO_DISTRIBUTE = 15;
const NUMBER_OF_STATS = 7;

function generateEvrmon(discordId) {
  const randomStats = generateRandomStats(TOTAL_POINTS_TO_DISTRIBUTE, NUMBER_OF_STATS);

  return {
    id: discordId,
    initiativeModifier: 30,
    Strength: randomStats[0],
    Dexterity: randomStats[1],
    Intelligence: randomStats[2],
    Fortitude: randomStats[3],
    Wisdom: randomStats[4],
    Armor: randomStats[5],
    Luck: randomStats[6],
    primaryStat: 5,
    secondaryStat: 5,
    tertiaryStat: 5,
    level: 1,
    hp: generateRandomHP(),
    Personality: "Noob",
    Talent: "Talentfree",
    Origin: "The Meadows",
    Class: "Evrmon",
    mainHandWeapon: {
      name: "Stick",
      description: "A small wooden stick that looks like it might break on it's first use",
      properties: {
      "Soul Class": {
        value: "MULTI",
          type: "string"
        },
        Rarity: {
          value: "Common",
            type: "string"
        },
        Slot: {
          value: "Main Hand",
            type: "string"
        },
        MaxDamage: {
          value: 2,
            type: "string"
        },
        MinDamage: {
          value: 1,
          type: "string"
        }
      }
    }
  }
}

function generateRandomStats(totalPoints, numberOfStats) {
  let stats = [];
  const averagePointsPerStat = Math.floor(totalPoints / numberOfStats);

  for (let i = 0; i < numberOfStats; i++) {
    const randomValue = Math.floor(Math.random() * (averagePointsPerStat * 2));

    const statValue = Math.max(1, randomValue);

    stats.push(statValue);

    totalPoints -= statValue;
  }

  while (totalPoints > 0) {
    const randomIndex = Math.floor(Math.random() * numberOfStats);
    stats[randomIndex] += 1;
    totalPoints -= 1;
  }

  return stats;
}
const MIN_HEARTS = 40;
const HEALTH_RANGE_UPWARDS = 11 // -> 40-50
function generateRandomHP() {
  return Math.floor(Math.random() * HEALTH_RANGE_UPWARDS) + MIN_HEARTS;
}
