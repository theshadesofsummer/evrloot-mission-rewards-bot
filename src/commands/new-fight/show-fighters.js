const {getOnlySouls, mapMetadataToSoul, getOnlyTemporarySouls} = require("../../evrloot-api");
const {mapStatusToSoul, soulSorterByStatus} = require("../../helpers/fighting-soul-helpers");
const {createChooseSoulFighterEmbeds} = require("../../embeds/choose-from-select-menu-embeds");
const {Pagination, ExtraRowPosition} = require("pagination.djs");
const {createSoulFighterMenuRow} = require("../../helpers/select-menu");


module.exports = {
  showFighters,
}

async function showFighters(interaction, wallets) {
  const allAccountsWithTemporarySouls = wallets.map(getOnlyTemporarySouls)
  Promise.all(allAccountsWithTemporarySouls).then(async temporarySoulsInAllAccounts => {
    const soulList = temporarySoulsInAllAccounts
      .flat()
      .map(mapMetadataToSoul)

    console.log('soulList', soulList)

    Promise.all(soulList).then(async soulListWithMetadata => {
      if (soulListWithMetadata.length <= 0) {
        await interaction.editReply('You currently have no souls in any of your connected wallets.');
        return;
      }

      console.log('soulListWithMetadata', soulListWithMetadata)

      const allSoulsWithStatus = await mapStatusToSoul(soulListWithMetadata)

      const sortedSoulsWithStatus = allSoulsWithStatus.sort(soulSorterByStatus)

      const embeds = createChooseSoulFighterEmbeds(sortedSoulsWithStatus);

      const pagination = new Pagination(interaction)
        .setEmbeds(embeds)
        .setEphemeral(true)
        .addActionRows([createSoulFighterMenuRow(sortedSoulsWithStatus, 'choose-fighter-a-menu')], ExtraRowPosition.Below);

      await pagination.render();
    })
  })
}