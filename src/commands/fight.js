const {SlashCommandBuilder} = require("discord.js");
const {getConnectedWallets} = require("../evrloot-db");
const handleInvite = require('./fight/handle-invite')
const showOpenInvitations = require('./fight/open-invitations')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fight')
    .setDescription('Pick one of your souls to fight against your friends or (soon to be) enemies!')
    .addSubcommand(subcommand =>
      subcommand.setName('invite')
        .setDescription('Start a challenge and wait for your opponent to accept or refuse.')
        .addUserOption(option =>
          option.setName('opponent')
            .setDescription('Your counterpart on the battlefield')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand.setName('open-invitations')
        .setDescription('Some people might want you challenge, check it out right here!')
    ),
  async execute(interaction) {
    await interaction.deferReply({
      ephemeral: true
    })

    const username = interaction.user.username
    const wallets = await getConnectedWallets({discordId: username})

    if (!wallets || wallets.length <= 0) {
      await interaction.editReply({
        content: `To have access to your souls you need to connect your wallet(s) to your discord account!`
      })
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'invite') {
      await handleInvite(interaction, wallets)
    } else if (subcommand === 'open-invitations') {
      await showOpenInvitations(interaction)
    }
  },
};
