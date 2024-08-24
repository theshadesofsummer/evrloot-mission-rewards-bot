const {getAuthor, getFields} = require("../trades/embed-helpers");
const {findClassEmote} = require("../helpers/emotes");

module.exports = function createSoulNewTradeEmbed(tradeInfo, textInfo, tradeCreator, soul, imageName) {
  const author = getAuthor(tradeCreator)
  const fields = getFields(tradeInfo, [], [], true)

  return {
    color: 0x5308a8,
    title: `${findClassEmote(soul.retrievedMetadata.properties['Soul Class'].value)} New Trade: ${textInfo.title}`,
    url: `https://game.evrloot.com/marketplace?mId=${tradeInfo.id}`,
    author,
    image: {
     url: `attachment://${imageName}`
    },
    description: textInfo.message,
    fields: [
      ...fields,
      {
        name: 'Stats',
        value: soulStatsFormatter(soul.retrievedMetadata.properties),
        inline: true
      },
      {
        name: 'Attributes',
        value: soulAttrFormatter(soul.retrievedMetadata.properties),
        inline: true
      },
      {
        name: 'Experience',
        value: soulExperienceFormatter(soul.experience.activities),
        inline: true
      },
      {
        name: 'Equipment',
        value: soulChildsFormatter(soul.children),
        inline: true
      }
    ],
    timestamp: new Date().toISOString(),
  };
}

function soulAttrFormatter(properties) {
  const soulClass = properties["Soul Class"].value;
  const personality = properties["Personality"].value;
  const talent = properties["Talent"].value;
  const origin = properties["Origin"].value;
  const condition = properties["Condition"].value;

  let returnString = '';

  returnString += `*Soul Class*: ${findClassEmote(soulClass)} ${soulClass}\n`;
  returnString += `*Personality*: ${personality}\n`;
  returnString += `*Talent*: ${talent}\n`;
  returnString += `*Origin*: ${origin}\n`;
  returnString += `*Condition*: ${condition}\n`;

  return returnString;
}

function soulStatsFormatter(properties) {
  const strength = properties["Strength"].value;
  const dexterity = properties["Dexterity"].value;
  const intelligence = properties["Intelligence"].value;
  const wisdom = properties["Wisdom"].value;
  const fortitude = properties["Fortitude"].value;
  const luck = properties["Luck"].value;

  let returnString = '';

  returnString += `*Strength*: ${strength}\n`;
  returnString += `*Dexterity*: ${dexterity}\n`;
  returnString += `*Intelligence*: ${intelligence}\n`;
  returnString += `*Wisdom*: ${wisdom}\n`;
  returnString += `*Fortitude*: ${fortitude}\n`;
  returnString += `*Luck*: ${luck}\n`;

  return returnString;
}

const shownExperiences = [1, 2, 3, 4, 6, 7, 9]

function soulExperienceFormatter(experiences) {
  console.log(experiences)
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

