const {SlashCommandBuilder} = require("discord.js");
const {createChooseSoulEmbeds} = require("../embeds/choose-from-select-menu-embeds.js");
const {ExtraRowPosition, Pagination} = require("pagination.djs");
const {getSouls} = require("../evrloot-api.js");
const {createSoulSelectMenuRow} = require("../helpers/select-menu");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('soul-info')
    .setDescription('Show of your legendary soul(s) to others!')
    .addStringOption(option =>
      option.setName('address')
        .setDescription('Put in the moonbeam address of your wallet (0x...)')
        .setRequired(true)
        .setMaxLength(42)
        .setMinLength(42)
    ),

  async execute(interaction) {
    interaction.deferReply({
      ephemeral: true
    })
    const address = interaction.options.getString('address')
    const souls = await getSouls(address);

    console.log('user', interaction.user.username, 'requested souls of', address);

    const embeds = createChooseSoulEmbeds(souls);

    const pagination = new Pagination(interaction)
      .setEmbeds(embeds)
      .setEphemeral(true)
      .addActionRows([createSoulSelectMenuRow(souls, 'choose-soul-menu')], ExtraRowPosition.Below);

    await pagination.render();
  },
};