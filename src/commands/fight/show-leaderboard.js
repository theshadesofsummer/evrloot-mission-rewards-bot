const createLeaderboardEmbed = require("../../embeds/leaderboard-embed");
const {getLeaderboardEntries} = require("../../evrloot-db");

module.exports = async function (interaction) {
  const leaderboardEntries = await getLeaderboardEntries();

  const topTen = leaderboardEntries
    .sort((le1, le2) => le2.amount - le1.amount)
    .slice(0, 10)

  console.log('topTen', topTen)
  await interaction.editReply({
    embeds: [createLeaderboardEmbed(topTen)]
  })
}

