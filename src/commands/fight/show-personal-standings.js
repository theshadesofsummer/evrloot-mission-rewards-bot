const {getLeaderboardEntries} = require("../../evrloot-db");
const {getOnlySouls} = require("../../evrloot-api");
const createPersonalStandingsEmbed = require("../../embeds/leaderboard-embed");

module.exports = async function (interaction, wallets) {
  const allAccountsWithSouls = wallets.map(getOnlySouls)
  Promise.all(allAccountsWithSouls).then(async soulsInAllAccounts => {
    const soulIds = soulsInAllAccounts
      .flat()
      .map(soul => soul.id)

    const leaderboardEntries = await getLeaderboardEntries();
    const sortedLeaderboardEntries = leaderboardEntries
      .sort((le1, le2) => le2.amount - le1.amount)

    const ownSoulsWithPoints = [];
    sortedLeaderboardEntries.forEach((entry, index) => {
      if (soulIds.includes(entry.soulId)) ownSoulsWithPoints.push({entry, index})
    })

    await interaction.editReply({
      embeds: [createPersonalStandingsEmbed(ownSoulsWithPoints)]
    })
  })
}

