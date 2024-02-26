const {SlashCommandBuilder, AttachmentBuilder} = require("discord.js");
const config = require("../config");
const createResourceRevealEmbed = require('../embeds/resource-reveal-embed')
const {postResourceReveal} = require("../discord-client");
const {addRevealDay} = require("../reveal-status");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reveal-resource')
    .setDescription('Command to reveal the new Resource!')
    .addIntegerOption(option =>
      option.setName('day')
        .setDescription('Current Day of Reveal')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(5)
    ),
  async execute(interaction) {
    await interaction.deferReply({
      ephemeral: true
    })

    if (!isUserAllowed(interaction.user.id)) {
      await interaction.editReply({content: 'You are not allowed to use this command!', ephemeral: true});
      return;
    } else {
      await interaction.editReply({content: 'Authorized, preparing further action!', ephemeral: true});
    }

    const day = interaction.options.getInteger('day');

    const newResource = getResourceInfoForDay(day);

    const revealEmbed = createResourceRevealEmbed(day, newResource)

    const attachments = new AttachmentBuilder()
      .setFile('static/' + newResource.imageFileName)
      .setName(newResource.imageFileName)

    const revealMessage = await postResourceReveal(revealEmbed, attachments)

    addRevealDay(day)

    await interaction.editReply({
      content: `The reveal has been published successfully.\nRecipes for day ${day} may be guessed.\n` +
        `Link: https://discord.com/channels/${revealMessage.guildId}/${revealMessage.channelId}/${revealMessage.id}`,
      ephemeral: true
    })
  }
};

const isUserAllowed = userId =>
  config.tournament.allowedUserIDs.includes(userId);

function getResourceInfoForDay(day) {
  switch (day) {
    case 1:
      return {
        name: 'Glade Grass',
        description: 'Such nice grass!',
        rarity: 'Common',
        imageFileName: 'glade-grass.png'
      }
    case 2:
      return {
        name: 'Cactus Leaf',
        description: 'These Leafes will blow your mind!',
        rarity: 'Common',
        imageFileName: 'cactus-leaf.png'
      };
    case 3:
      return {
        name: 'Dry Sand Herb',
        description: 'Much dry!',
        rarity: 'Common',
        imageFileName: 'dry-sand-herb.png'
      };
    case 4:
      return {
        name: 'Mirage Sprout',
        description: 'Mystical thing!',
        rarity: 'Rare',
        imageFileName: 'mirage-sprout.png'
      };
    case 5:
      return {
        name: 'Deep Root',
        description: 'Deeply rooted innit!',
        rarity: 'Epic',
        imageFileName: 'deeproot.png'
      };
    default:
      return {}
  }
}