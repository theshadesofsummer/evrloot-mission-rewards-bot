const {findClassEmoteObject} = require("./emotes");
const {StringSelectMenuBuilder, ActionRowBuilder} = require("discord.js");

module.exports = {
  createSelectMenuRow
}

function createSelectMenuRow(souls, customId, insertId = undefined) {
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