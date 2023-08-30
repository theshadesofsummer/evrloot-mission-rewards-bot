const {findClassEmoteObject} = require("./emotes");
const {StringSelectMenuBuilder, ActionRowBuilder} = require("discord.js");

module.exports = {
  createSoulSelectMenuRow,
  createSoulFighterMenuRow,
  createOpponentSelectMenuRow
}

function createSoulSelectMenuRow(souls, customId) {
  const chooseSoulButtons = souls.map((soul, index) => ({
    label: `[${index+1}] ${soul.retrievedMetadata.name}`,
    value: soul.id,
    emoji: findClassEmoteObject(soul.retrievedMetadata.properties['Soul Class'].value)
  }));
  const chooseSoulSelectMenu = new StringSelectMenuBuilder()
    .setCustomId(customId)
    .addOptions(chooseSoulButtons)
  return new ActionRowBuilder().setComponents(chooseSoulSelectMenu)
}

function createSoulFighterMenuRow(soulsWithStatus, customId, insertId) {
  const chooseSoulButtons = soulsWithStatus.map((soulWithStatus, index) => ({
    label: `[${index+1}] ${soulWithStatus.retrievedMetadata.name}`,
    value: `${insertId};${soulWithStatus.id}`,
    emoji: findClassEmoteObject(soulWithStatus.retrievedMetadata.properties['Soul Class'].value)
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