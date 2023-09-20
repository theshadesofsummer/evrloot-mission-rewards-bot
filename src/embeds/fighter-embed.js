module.exports = function createFighterEmbed(userId, soul) {
  const { soulSpecificStatName, soulSpecificStatValue } = soulClassSpecificName(soul);

  return {
    color: 0xae1917,
    description: `<@${userId}> is fighting with **${soul.retrievedMetadata.name}**`,
    thumbnail: {
      url: soul.retrievedMetadata.image
    },
    fields: [
      {
        name: 'Personality',
        value: getProperty(soul, 'Personality'),
        inline: true
      },
      {
        name: 'Talent',
        value: getProperty(soul, 'Talent'),
        inline: true
      },
      {
        name: 'Origin',
        value: getProperty(soul, 'Origin'),
        inline: true
      },
      {
        name: 'Condition',
        value: getProperty(soul, 'Condition'),
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
function soulClassSpecificName(soul) {
  const statName = specificClassNames.get(soul.retrievedMetadata.properties["Soul Class"].value);
  const statValue = soul.retrievedMetadata.properties[statName].value;

  return {
    soulSpecificStatName: statName,
    soulSpecificStatValue: statValue,
  }
}

function statsFormatter(soul) {
  return `*Strength*: ${getStatFormat(getProperty(soul, 'Strength'), 8)} ${upgradedStat(soul.children, 'Strength')}\n` +
    `*Dexterity*: ${getStatFormat(getProperty(soul, 'Dexterity'), 8)} ${upgradedStat(soul.children, 'Dexterity')}\n` +
    `*Intelligence*: ${getStatFormat(getProperty(soul, 'Intelligence'), 8)} ${upgradedStat(soul.children, 'Intelligence')}\n` +
    `*Wisdom*: ${getStatFormat(getProperty(soul, 'Wisdom'), 8)} ${upgradedStat(soul.children, 'Wisdom')}\n` +
    `*Fortitude*: ${getStatFormat(getProperty(soul, 'Fortitude'), 8)} ${upgradedStat(soul.children, 'Fortitude')}\n` +
    `*Luck*: ${getStatFormat(getProperty(soul, 'Luck'), 4)} ${upgradedStat(soul.children, 'Luck')}`;
}

function getProperty(soul, attribute) {
  return soul.retrievedMetadata.properties[attribute].value
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
