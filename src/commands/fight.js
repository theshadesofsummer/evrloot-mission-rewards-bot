const {SlashCommandBuilder} = require("discord.js");
const {getAllFighterAccounts} = require("../evrloot-db");
const handleInvite = require('./fight/handle-invite')
const handleFightAccept = require('./fight/fight-accept')
const fightOverview = require('./fight/fight-overview')
const fightRevoke = require('./fight/fight-revoke')
const showLeaderboard = require('./fight/show-leaderboard')
const showPersonalStandings = require('./fight/show-personal-standings')
//const handleFightAnyone = require('./fight/fight-anyone')
const config = require("../config");

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
    )
    .addSubcommand(subcommand =>
      subcommand.setName('leaderboard')
        .setDescription('Check who has the highest rating among them all!')
    )
    .addSubcommand(subcommand =>
      subcommand.setName('personal-standings')
        .setDescription('See how your souls perform in the tournament!')
        .addBooleanOption(option =>
          option.setName('mobile')
            .setDescription('Mobile Compact version of leaderboard'))
    // )
    // .addSubcommand(subcommand =>
    //   subcommand.setName('anyone')
    //     .setDescription('Fight against anyone available!')
    ),
  async execute(interaction) {
    await interaction.deferReply({
      ephemeral: true
    })

    const userId = interaction.user.id
    const accounts = await getAllFighterAccounts(userId)
    const wallets = accounts.map(account => account.wallet)

    if (!wallets || wallets.length <= 0) {
      await interaction.editReply(`To take part in the fights you need to have at least one wallet verified and not anonymous!`)
      return;
    }

    const subcommand = interaction.options.getSubcommand();
    const isTournamentRunning = config.tournament.started;
    if (subcommand === 'invite') {
      if (!isTournamentRunning) {
        await interaction.editReply('The tournament is not running anymore, the invite was not sent out!')
        return;
      }
      await handleInvite(interaction, wallets)
    } else if (subcommand === 'accept') {
      if (!isTournamentRunning) {
        await interaction.editReply('The tournament is not running anymore, the invite was not accepted!')
        return;
      }
      await handleFightAccept(interaction)
    } else if (subcommand === 'overview') {
      if (!isTournamentRunning) {
        await interaction.editReply('The tournament is not running anymore!')
        return;
      }
      await fightOverview(interaction)
    } else if (subcommand === 'revoke') {
      await fightRevoke(interaction)
    } else if (subcommand === 'leaderboard') {
      await showLeaderboard(interaction)
    } else if (subcommand === 'personal-standings') {
      await showPersonalStandings(interaction, wallets)
    // } else if (subcommand === 'anyone') {
    //   await handleFightAnyone(interaction, wallets)
    }
  },
};
