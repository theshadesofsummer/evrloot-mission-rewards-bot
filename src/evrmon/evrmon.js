const {SlashCommandBuilder} = require("discord.js");
const handleInvite = require('../commands/fight/handle-invite')
const {getEvrmonForDiscordId} = require("../evrmon-db");
const {createEvrmon} = require("./create-evrmon");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('evrmon')
    .setDescription('Enjoy a brand new discord powered journey showcasing the Evrloot way of living!')
    .addSubcommand(subcommand =>
      subcommand.setName('start')
        .setDescription('Embark on new journey, but a choice must be made!')
    )
    .addSubcommand(subcommand =>
      subcommand.setName('see')
        .setDescription('See Evrmon!')
    ),
  async execute(interaction) {
    await interaction.deferReply({
      ephemeral: true
    })

    const userId = interaction.user.id
    const evrmon = await getEvrmonForDiscordId(userId)

    const subcommand = interaction.options.getSubcommand();
    if (subcommand === 'start') {
      if (!evrmon) {
        await createEvrmon(interaction, userId)
        return;
      } else {
        await interaction.editReply('You already have your Evrmon!')
      }
    }
  }
};
