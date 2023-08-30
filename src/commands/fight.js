const {SlashCommandBuilder} = require("discord.js");
const {getConnectedAccounts} = require("../evrloot-db");
const handleInvite = require('./fight/handle-invite')
const handleFightAccept = require('./fight/fight-accept')
const fightOverview = require('./fight/fight-overview')
const fightRevoke = require('./fight/fight-revoke')
module.exports = {
  data: new SlashCommandBuilder()
    .setName('fight')
    .setDescription('Pick one of your souls to fight against your friends or (soon to be) enemies!')
    .addSubcommand(subcommand =>
      subcommand.setName('overview')
        .setDescription('See all your pending and incoming fights!')
    )
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
      subcommand.setName('accept')
        .setDescription('Some people might have challenged you, check it out right here!')
    )
    .addSubcommand(subcommand =>
      subcommand.setName('revoke')
        .setDescription('Remove one of your open invitations and potentially free your soul')
        .addUserOption(option =>
          option.setName('opponent')
            .setDescription('Your counterpart on the battlefield')
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    await interaction.deferReply({
      ephemeral: true
    })

    const username = interaction.user.username
    const accounts = await getConnectedAccounts(username)
    const wallets = accounts.map(account => account.wallet)

    if (!wallets || wallets.length <= 0) {
      await interaction.editReply(`To use the fights you need to have at least one wallet connected!`)
      return;
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'invite') {
      await handleInvite(interaction, wallets)
    } else if (subcommand === 'accept') {
      await handleFightAccept(interaction)
    } else if (subcommand === 'overview') {
      await fightOverview(interaction)
    } else if (subcommand === 'revoke') {
      await fightRevoke(interaction)
    }
  },
};
