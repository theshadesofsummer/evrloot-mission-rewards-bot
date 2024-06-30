const {getLeaderboardEntries} = require("../../evrloot-db");
const { getOnlyTemporarySouls } = require("../../evrloot-api");
const createPersonalStandingsEmbed = require("../../embeds/personal-standings-embed");

module.exports = async function (interaction, wallets) {
  const allAccountsWithSouls = wallets.map(getOnlyTemporarySouls)
  Promise.all(allAccountsWithSouls).then(async soulsInAllAccounts => {
    const soulIds = soulsInAllAccounts
      .flat()
      .map(soul => `EVR-SOULS-${soul.temporarySoul.id}`)

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

