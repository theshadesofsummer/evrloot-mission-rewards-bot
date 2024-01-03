const {getAllFighterAccounts, getFightByFighters} = require("../../evrloot-db");
const {getOnlySouls, mapMetadataToSoul} = require("../../evrloot-api");
const {createChooseSoulFighterEmbeds} = require("../../embeds/choose-from-select-menu-embeds");
const {Pagination, ExtraRowPosition} = require("pagination.djs");
const {createSoulFighterMenuRow} = require("../../helpers/select-menu");
const {mapStatusToSoul, soulSorterByStatus} = require("../../helpers/fighting-soul-helpers");

module.exports = {
  async execute(interaction) {
    interaction.deferReply({
      ephemeral: true
    })
    const fighterA = interaction.values[0];
    const fighterB = interaction.user.id;

    const fight = await getFightByFighters(fighterA, fighterB)

    if (!fight) {
      interaction.editReply('This fight cannot be found or has already happened.')
      return;
    }

    const accounts = await getAllFighterAccounts(fighterB)
    const wallets = accounts.map(account => account.wallet)

    if (!wallets || wallets.length <= 0) {
      await interaction.editReply(`To accept this fights you need to have at least one wallet verified and not anonymous!`)
      return;
    }

    const allAccountsWithSouls = wallets.map(getOnlySouls)
    Promise.all(allAccountsWithSouls).then(async soulsInAllAccounts => {
      const soulList = soulsInAllAccounts
        .flat()
        .map(mapMetadataToSoul)

      Promise.all(soulList).then(async soulListWithMetadata => {
        if (soulListWithMetadata.length <= 0) {
          await interaction.editReply('You currently have no souls in any of your verified and non anonymous wallets.');
          return;
        }

        const allSoulsWithStatus = await mapStatusToSoul(soulListWithMetadata)

        const sortedSoulsWithStatus = allSoulsWithStatus.sort(soulSorterByStatus)

        const embeds = createChooseSoulFighterEmbeds(sortedSoulsWithStatus);

        const pagination = new Pagination(interaction)
          .setEmbeds(embeds)
          .setEphemeral(true)
          .addActionRows([createSoulFighterMenuRow(sortedSoulsWithStatus, 'choose-fighter-b-menu', fight._id)], ExtraRowPosition.Below);

        await pagination.render();
      })
    })
  },
}
