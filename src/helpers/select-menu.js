const {findClassEmoteObject} = require("./emotes");
const {StringSelectMenuBuilder, ActionRowBuilder} = require("discord.js");
const {mapClientIdToName} = require("../discord-client");
const {findValueForAttribute} = require("./attribute-finder");

module.exports = {
  createSoulSelectMenuRow,
  createSoulFighterMenuRow,
  createOpponentSelectMenuRow
}

function createSoulSelectMenuRow(souls, customId) {
  const chooseSoulButtons = souls
    .slice(0, 25)
    .map((soul, index) => ({
      label: `[${index + 1}] ${soul.retrievedMetadata.name}`,
      value: soul.id,
      emoji: findClassEmoteObject(findValueForAttribute(soul.retrievedMetadata.attributes, 'Soul Class'))
    }));
  const chooseSoulSelectMenu = new StringSelectMenuBuilder()
    .setCustomId(customId)
    .addOptions(chooseSoulButtons)
  return new ActionRowBuilder().setComponents(chooseSoulSelectMenu)
}

function createSoulFighterMenuRow(soulsWithStatus, customId) {
  const chooseSoulButtons = soulsWithStatus
    .slice(0, 25)
    .map((soulWithStatus, index) => ({
      label: `[${index + 1}] ${soulWithStatus.retrievedMetadata.name}`,
      value: `${soulWithStatus.id}`,
      emoji: findClassEmoteObject(findValueForAttribute(soulWithStatus.retrievedMetadata.attributes, 'Soul Class'))
    }));
  const chooseSoulSelectMenu = new StringSelectMenuBuilder()
    .setCustomId(customId)
    .addOptions(chooseSoulButtons)
  return new ActionRowBuilder().setComponents(chooseSoulSelectMenu)
}

async function createOpponentSelectMenuRow(opponentIds, customId) {
  const opponentNames = await mapClientIdToName(opponentIds)
  const chooseOpponentButtons = opponentNames
    .slice(0, 25)
    .map((opponentName, index) => ({
      label: `[${index + 1}] ${opponentName}`,
      value: opponentIds[index]
    }));
  const chooseSoulSelectMenu = new StringSelectMenuBuilder()
    .setCustomId(customId)
    .addOptions(chooseOpponentButtons)
  return new ActionRowBuilder().setComponents(chooseSoulSelectMenu)
}