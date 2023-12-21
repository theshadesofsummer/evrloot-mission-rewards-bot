const {findValueForAttribute} = require("../helpers/attribute-finder");

module.exports = function createFighterEmbed(userId, souls) {
  console.log('incoming souls:', souls)
  const soul = souls[0]
  const properties = soul.retrievedMetadata.properties
  const { soulSpecificStatName, soulSpecificStatValue } = soulClassSpecificName(properties);

  return {
    color: 0xae1917,
    description: `<@${userId}> is fighting with **${soul.retrievedMetadata.name}**`,
    thumbnail: {
      url: soul.retrievedMetadata.image
    },
    fields: [
      {
        name: 'Personality',
        value: properties['Personality'],
        inline: true
      },
      {
        name: 'Talent',
        value: properties['Talent'],
        inline: true
      },
      {
        name: 'Origin',
        value: properties['Origin'],
        inline: true
      },
      {
        name: 'Condition',
        value: properties['Condition'],
        inline: true
      },
      {
        name: soulSpecificStatName,
        value: soulSpecificStatValue,
        inline: true,
      },
      {
        name: '',
        value: '',
        inline: true,
      },
      {
        name: 'Stats',
        value: statsFormatter(soul),
        inline: true
      },
      {
        name: 'Equipment',
        value: equipmentFormatter(soul.children),
        inline: true
      },
    ],
  };
}

const specificClassNames = new Map([
  ["Alchemist", "Specialty"],
  ["Berserker", "Role"],
  ["Ranger", "Spirit Animal"]
])
function soulClassSpecificName(properties) {
  const statName = specificClassNames.get(properties["Soul Class"]);
  const statValue = properties.statName;

  return {
    soulSpecificStatName: statName,
    soulSpecificStatValue: statValue,
  }
}

function statsFormatter(soul) {
  const properties = soul.retrievedMetadata.properties
  return `*Strength*: ${getStatFormat(properties['Strength'], 8)} ${upgradedStat(soul.children, 'Strength')}\n` +
    `*Dexterity*: ${getStatFormat(properties['Dexterity'], 8)} ${upgradedStat(soul.children, 'Dexterity')}\n` +
    `*Intelligence*: ${getStatFormat(properties['Intelligence'], 8)} ${upgradedStat(soul.children, 'Intelligence')}\n` +
    `*Wisdom*: ${getStatFormat(properties['Wisdom'], 8)} ${upgradedStat(soul.children, 'Wisdom')}\n` +
    `*Fortitude*: ${getStatFormat(properties['Fortitude'], 8)} ${upgradedStat(soul.children, 'Fortitude')}\n` +
    `*Luck*: ${getStatFormat(properties['Luck'], 4)} ${upgradedStat(soul.children, 'Luck')}`;
}


function getStatFormat(stat, goodValue) {
  return stat >= goodValue ? `**${stat}**` : stat.toString();
}

function upgradedStat(soulChildren, statType) {
  const effectingChildNfts = soulChildren
    .filter(childNft => childNft.retrievedMetadata.properties[statType])

  if (effectingChildNfts.length < 1) return ""

  const upgradeAmount = effectingChildNfts.reduce((acc, childNft) => acc + Number(childNft.retrievedMetadata.properties[statType].value), 0)
  return `***+${upgradeAmount}***`;
}

const equipmentParts = [
  'Head',
  'Armor',
  'Feet',
  'MainHand',
  'OffHand'
]
function equipmentFormatter(soulChildren) {
  let returnString = '';
  for (const partName of equipmentParts) {
    const child = getChildForPartName(soulChildren, partName)
    if (child)
      returnString += `*${partName}*: ${child.retrievedMetadata.name} (${child.retrievedMetadata.properties['Rarity'].value})\n`
  }
  return returnString;
}

function getChildForPartName(soulChildren, partName) {
  return soulChildren.find(child => child.partDescription === partName)
}
