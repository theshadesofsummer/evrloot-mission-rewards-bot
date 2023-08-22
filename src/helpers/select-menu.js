const {findClassEmoteObject} = require("./emotes");
const {StringSelectMenuBuilder, ActionRowBuilder} = require("discord.js");

module.exports = {
  createSoulSelectMenuRow,
  createOpponentSelectMenuRow
}

function createSoulSelectMenuRow(souls, customId, insertId = undefined) {
  const chooseSoulButtons = souls.map((soul, index) => ({
    label: `[${index+1}] ${soul.retrievedMetadata.name}`,
    value: insertId ? `${insertId};${soul.id}` : soul.id,
    emoji: findClassEmoteObject(soul.retrievedMetadata.properties['Soul Class'].value)
  }));
  const chooseSoulSelectMenu = new StringSelectMenuBuilder()
    .setCustomId(customId)
    .addOptions(chooseSoulButtons)
  return new ActionRowBuilder().setComponents(chooseSoulSelectMenu)
}

function createOpponentSelectMenuRow(opponents, customId) {
  const chooseOpponentButtons = opponents.map((opponent, index) => ({
    label: `[${index+1}] ${opponent}`,
    value: opponent
  }));
  const chooseSoulSelectMenu = new StringSelectMenuBuilder()
    .setCustomId(customId)
    .addOptions(chooseOpponentButtons)
  return new ActionRowBuilder().setComponents(chooseSoulSelectMenu)
}