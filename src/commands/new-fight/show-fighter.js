const {mapMetadataToSoul, getOnlyTemporarySouls} = require("../../evrloot-api");
const {mapStatusToSoul, soulSorterByStatus} = require("../../helpers/fighting-soul-helpers");
const {createChooseSoulFighterEmbeds} = require("../../embeds/choose-from-select-menu-embeds");
const {Pagination, ExtraRowPosition} = require("pagination.djs");
const {createSoulFighterMenuRow} = require("../../helpers/select-menu");


module.exports = {
  showFighter,
}

async function showFighter(interaction, wallets) {
  await interaction.editReply('<a:Doubloon:1256636404658602076> Fetching Fighters')
  const allAccountsWithTemporarySouls = wallets.map(getOnlyTemporarySouls)
  Promise.all(allAccountsWithTemporarySouls).then(async temporarySoulsInAllAccounts => {
    const soulList = temporarySoulsInAllAccounts
      .flat()
      .map(mapMetadataToSoul)
    await interaction.editReply('<a:Doubloon:1256636404658602076> Getting Fighter Information')

    Promise.all(soulList).then(async soulListWithMetadata => {
      if (soulListWithMetadata.length <= 0) {
        await interaction.editReply('You currently have no souls in any of your connected wallets.');
        return;
      }

      await interaction.editReply('<a:Doubloon:1256636404658602076> Checking if fighter is on cooldown or in fight pool')
      const allSoulsWithStatus = await mapStatusToSoul(soulListWithMetadata)

      const sortedSoulsWithStatus = allSoulsWithStatus.sort(soulSorterByStatus)

      const embeds = createChooseSoulFighterEmbeds(sortedSoulsWithStatus);

      const pagination = new Pagination(interaction)
        .setEmbeds(embeds)
        .setEphemeral(true)
        .addActionRows([createSoulFighterMenuRow(sortedSoulsWithStatus, 'show-fighter-menu')], ExtraRowPosition.Below);

      await interaction.editReply('Select Fighter:')

      await pagination.render();
    })
  })
}