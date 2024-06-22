const {SlashCommandBuilder} = require("discord.js");
const config = require("../../config");
const {showFighters} = require("./show-fighters");
const {getAllFighterAccounts} = require("../../evrloot-db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tournament')
    .setDescription('Pick one of your souls to fight against your friends or (soon to be) enemies!')
    .addSubcommand(subcommand =>
      subcommand.setName('show-fighters')
        .setDescription('Show of your fighters!')
    )
    .addSubcommand(subcommand =>
      subcommand.setName('fight')
        .setDescription('Start a challenge and wait for an opponent!')
    )
    .addSubcommand(subcommand =>
      subcommand.setName('leaderboard')
        .setDescription('Check who has the highest rating among them all!')
        .addBooleanOption(option =>
          option.setName('mobile')
            .setDescription('Mobile Compact version of leaderboard')
        )
    )
    .addSubcommand(subcommand =>
        subcommand.setName('personal-standings')
          .setDescription('See how your soul performs in the tournament!')
    ),
  async execute(interaction) {
    await interaction.deferReply({
      ephemeral: true
    })

    try {
      const userId = interaction.user.id
      const accounts = await getAllFighterAccounts(userId)
      const wallets = accounts.map(account => account.wallet)

      if (!wallets || wallets.length <= 0) {
        await interaction.editReply(`To take part in the fights you need to have at least one wallet verified and not anonymous!`)
        return;
      }

      const subcommand = interaction.options.getSubcommand();
      const isTournamentRunning = config.tournament.started;
      if (subcommand === 'show-fighters') {
        await showFighters(interaction, wallets)
        // } else if (subcommand === 'accept') {
        //   if (!isTournamentRunning) {
        //     await interaction.editReply('The tournament is not running anymore, the invite was not accepted!')
        //     return;
        //   }
        //   await handleFightAccept(interaction)
        // } else if (subcommand === 'overview') {
        //   if (!isTournamentRunning) {
        //     await interaction.editReply('The tournament is not running anymore!')
        //     return;
        //   }
        //   await fightOverview(interaction)
        // } else if (subcommand === 'revoke') {
        //   await fightRevoke(interaction)
        // } else if (subcommand === 'leaderboard') {
        //   await showLeaderboard(interaction)
        // } else if (subcommand === 'personal-standings') {
        //   await showPersonalStandings(interaction, wallets)
        //   // } else if (subcommand === 'anyone') {
        //   //   await handleFightAnyone(interaction, wallets)
      }
    } catch (e) {
      console.error(e)
      interaction.editReply('There was an error executing this command.')
    }

  }
};
