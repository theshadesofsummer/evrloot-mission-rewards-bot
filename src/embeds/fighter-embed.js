const {findValueForAttribute} = require("../helpers/attribute-finder");
module.exports = function createFighterEmbed(userId, soul) {
  const { soulSpecificStatName, soulSpecificStatValue } = soulClassSpecificName(soul);
  const attributes = soul.retrievedMetadata.attributes;

  return {
    color: 0xae1917,
    description: `<@${userId}> is fighting with **${soul.retrievedMetadata.name}**`,
    thumbnail: {
      url: soul.retrievedMetadata.image
    },
    fields: [
      {
        name: 'Personality',
        value: findValueForAttribute(attributes, 'Personality'),
        inline: true
      },
      {
        name: 'Talent',
        value: findValueForAttribute(attributes, 'Talent'),
        inline: true
      },
      {
        name: 'Origin',
        value: findValueForAttribute(attributes, 'Origin'),
        inline: true
      },
      {
        name: 'Condition',
        value: findValueForAttribute(attributes, 'Condition'),
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
function soulClassSpecificName(attributes) {
  const statName = specificClassNames.get(findValueForAttribute(attributes, "Soul Class"));
  const statValue = findValueForAttribute(attributes, statName);

  return {
    soulSpecificStatName: statName,
    soulSpecificStatValue: statValue,
  }
}

function statsFormatter(soul) {
  const attributes = soul.retrievedMetadata.attributes;

  return `*Strength*: ${getStatFormat(findValueForAttribute(attributes, 'Strength'), 8)} ${upgradedStat(soul.children, 'Strength')}\n` +
    `*Dexterity*: ${getStatFormat(findValueForAttribute(attributes, 'Dexterity'), 8)} ${upgradedStat(soul.children, 'Dexterity')}\n` +
    `*Intelligence*: ${getStatFormat(findValueForAttribute(attributes, 'Intelligence'), 8)} ${upgradedStat(soul.children, 'Intelligence')}\n` +
    `*Wisdom*: ${getStatFormat(findValueForAttribute(attributes, 'Wisdom'), 8)} ${upgradedStat(soul.children, 'Wisdom')}\n` +
    `*Fortitude*: ${getStatFormat(findValueForAttribute(attributes, 'Fortitude'), 8)} ${upgradedStat(soul.children, 'Fortitude')}\n` +
    `*Luck*: ${getStatFormat(findValueForAttribute(attributes, 'Luck'), 4)} ${upgradedStat(soul.children, 'Luck')}`;
}


function getStatFormat(stat, goodValue) {
  return stat >= goodValue ? `**${stat}**` : stat.toString();
}

function upgradedStat(soulChildren, statType) {
  // const effectingChildNfts = soulChildren
  //   .filter(childNft => childNft.retrievedMetadata.properties[statType])
  //
  // if (effectingChildNfts.length < 1) return ""
  //
  // const upgradeAmount = effectingChildNfts.reduce((acc, childNft) => acc + Number(childNft.retrievedMetadata.properties[statType].value), 0)
  // return `***+${upgradeAmount}***`;
  return ''
}

const equipmentParts = [
  'Head',
  'Armor',
  'Feet',
  'MainHand',
  'OffHand'
]
function equipmentFormatter(soulChildren) {
  // let returnString = '';
  // for (const partName of equipmentParts) {
  //   const child = getChildForPartName(soulChildren, partName)
  //   if (child)
  //     returnString += `*${partName}*: ${child.retrievedMetadata.name} (${child.retrievedMetadata.properties['Rarity'].value})\n`
  // }
  // return returnString;
  return 'missing'
}

function getChildForPartName(soulChildren, partName) {
  return soulChildren.find(child => child.partDescription === partName)
}
