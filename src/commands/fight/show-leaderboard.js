const createLeaderboardEmbed = require("../../embeds/leaderboard-embed");
const {getLeaderboardEntries} = require("../../evrloot-db");

module.exports = async function (interaction) {
  let isForMobile = interaction.options.getBoolean('mobile');

  const leaderboardEntries = await getLeaderboardEntries();

  const topTen = leaderboardEntries
    .sort((le1, le2) => le2.amount - le1.amount)
    .slice(0, 10)

  await interaction.editReply({
    embeds: [createLeaderboardEmbed(topTen, isForMobile)]
  })
}

