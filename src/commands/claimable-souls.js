const {SlashCommandBuilder} = require("discord.js");
const {getAllFighterAccounts} = require("../evrloot-db");
const {getOnlySouls, mapMetadataToSoul} = require("../evrloot-api");
const createSoulMissionStatusEmbed = require('../embeds/soul-mission-status-embed')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('claimable-souls')
    .setDescription('Check if your souls came back from their missions!'),
  async execute(interaction) {
    await interaction.deferReply({
      ephemeral: true
    })

    const userId = interaction.user.id
    const accounts = await getAllFighterAccounts(userId)
    const wallets = accounts.map(account => account.wallet)

    if (!wallets || wallets.length <= 0) {
      await interaction.editReply(`To check your souls you need to have connected at least one wallet with the discord bot on the [official Evrloot Website](<https://game.evrloot.com/>) `
        + `or check if your connected wallets are not anonymised with \`/wallet-settings\`.`)
      return;
    }

    await interaction.editReply(`Searching for all your souls in Trakan...`)

    const allAccountsWithSouls = wallets.map(getOnlySouls)
    Promise.all(allAccountsWithSouls).then(async soulsInAllAccounts => {
      const soulList = soulsInAllAccounts
        .flat()
        .map(mapMetadataToSoul)

      Promise.all(soulList).then(async soulListWithMetadata => {
        if (soulListWithMetadata.length <= 0) {
          await interaction.editReply('You currently have no souls in any of your connected wallets.');
          return;
        }

        const soulsSortedByClaimTime = soulListWithMetadata
          .sort((soulA, soulB) => {
              if (soulA.lastPlayerMission.reachedEndTime && soulB.lastPlayerMission.reachedEndTime) { // both finished -> claimed?
                if (soulA.lastPlayerMission.claimedTime && soulB.lastPlayerMission.claimedTime) { // both claimable -> time
                  return soulA.lastPlayerMission.claimedTime.localeCompare(soulB.lastPlayerMission.claimedTime)
                }
                if (soulA.lastPlayerMission.claimedTime) { // A is claimed -> back
                  return 1
                }
                return soulA.lastPlayerMission.endTime.localeCompare(soulB.lastPlayerMission.endTime)
              } else { // both waiting -> end time
                return soulA.lastPlayerMission.endTime.localeCompare(soulB.lastPlayerMission.endTime)
              }
            }
          )

        const soulMissionStatusEmbed = await createSoulMissionStatusEmbed(userId, soulsSortedByClaimTime)
        await interaction.editReply({
          content: 'Here is the current status of all your souls:',
          embeds: [soulMissionStatusEmbed]
        })
      })
    })
  }
};
