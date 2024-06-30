const {SlashCommandBuilder} = require("discord.js");
const config = require("../../config");
const {showFighters} = require("./show-fighter");
const {getAllFighterAccounts} = require("../../evrloot-db");
const { battle } = require("./battle");
const showLeaderboard = require("../fight/show-leaderboard");
const showPersonalStandings = require("../fight/show-personal-standings");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tournament')
    .setDescription('Pick one of your souls to fight against your friends or (soon to be) enemies!')
    .addSubcommand(subcommand =>
      subcommand.setName('battle')
        .setDescription('Start a challenge and wait for an opponent!')
    )
    // .addSubcommand(subcommand =>
    //   subcommand.setName('show-fighter')
    //     .setDescription('Show of your fighter(s)!')
    // )
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
    await interaction.editReply('<a:Doubloon:1256636404658602076> Processing Command')

    try {
      const userId = interaction.user.id

      await interaction.editReply('<a:Doubloon:1256636404658602076> Fetching connected wallets')
      const accounts = await getAllFighterAccounts(userId)
      const wallets = accounts.map(account => account.wallet)

      if (!wallets || wallets.length <= 0) {
        await interaction.editReply(`To take part in the fights you need to have at least one wallet verified and not anonymous!`)
        return;
      }

      const subcommand = interaction.options.getSubcommand();
      const isTournamentRunning = config.tournament.started;
      if (!isTournamentRunning) {
        await interaction.editReply('The tournament is not running!')
        return;
      }

      if (subcommand === 'battle') {
        await battle(interaction, wallets)
      } else if (subcommand === 'show-fighter') {
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
        } else if (subcommand === 'leaderboard') {
          await showLeaderboard(interaction)
        } else if (subcommand === 'personal-standings') {
          await showPersonalStandings(interaction, wallets)
        //   // } else if (subcommand === 'anyone') {
        //   //   await handleFightAnyone(interaction, wallets)
      }
    } catch (e) {
      console.error(e)
      interaction.editReply('There was an error executing this command.')
    }

  }
};
