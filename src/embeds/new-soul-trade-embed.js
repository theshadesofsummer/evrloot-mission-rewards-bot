const {getAuthor, getFields} = require("../trades/embed-helpers");
const {findClassEmote} = require("../helpers/emotes");

module.exports = function createSoulNewTradeEmbed(tradeInfo, textInfo, tradeCreator, soul, imageName) {
  const author = getAuthor(tradeCreator)
  const fields = getFields(tradeInfo, [], [], true)

  return {
    color: 0x5308a8,
    title: `${findClassEmote(soul.retrievedMetadata.properties['Soul Class'].value)} New Trade: ${textInfo
      ? textInfo.title
      : 'no title'
    }`,
    url: `https://game.evrloot.com/marketplace?mId=${tradeInfo.id}`,
    author,
    image: {
     url: `attachment://${imageName}`
    },
    description: textInfo
      ? textInfo.message
      : 'no message',
    fields: [
      ...fields,
      {
        name: 'Experience',
        value: soulExperienceFormatter(soul.experience.activities),
        inline: true
      },
      {
        name: 'Equipment',
        value: soulChildsFormatter(soul.children),
        inline: true
      },
      {
        name: 'Properties',
        value: soulStatsFormatter(soul.retrievedMetadata.properties),
        inline: false
      },
    ],
    timestamp: new Date().toISOString(),
  };
}

function soulStatsFormatter(properties) {
  let returnString = '';

  Object.entries(properties).forEach(([name, property]) => {
    returnString += `*${name}*: ${property.value}\n`;
  })

  return returnString;
}

const shownExperiences = [1, 2, 3, 4, 6, 7, 9]

function soulExperienceFormatter(experiences) {
  const expStrings = experiences
    .filter(exp => shownExperiences.includes(exp.activityId))
    .map(getExpString)

  let returnString = '';

  expStrings.forEach(expString => returnString += expString)

  return returnString;
}

function getExpString(exp) {
  return `*${exp.activityName}*: ${exp.experience}\n`
}

function soulChildsFormatter(children) {
  let returnString = '';
  children
    .sort(raritySorter)
    .forEach(child => returnString += `[${child.retrievedMetadata.properties["Rarity"].value}] *${child.retrievedMetadata.name}*\n`)

  return returnString;
}

const raritySortValue = new Map([
  ['Common', 0],
  ['Rare', 1],
  ['Epic', 2],
  ['Legendary', 3],
])

function raritySorter(entryA, entryB) {
  const rarityA = entryA.retrievedMetadata.properties["Rarity"].value;
  const rarityB = entryB.retrievedMetadata.properties["Rarity"].value;

  return raritySortValue.get(rarityA) - raritySortValue.get(rarityB)
}

