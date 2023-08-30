const {getConnectedAccounts, soulIsInFight, getFightByFighters, getOutstandingInvitationWithSoul, getSoulCooldown} = require("../../evrloot-db");
const {getOnlySouls} = require("../../evrloot-api");
const {createChooseSoulEmbeds, createChooseSoulFighterEmbeds} = require("../../embeds/choose-from-select-menu-embeds");
const {Pagination, ExtraRowPosition} = require("pagination.djs");
const {createSoulSelectMenuRow, createSoulFighterMenuRow} = require("../../helpers/select-menu");
const {mapStatusToSoul, soulSorterByStatus, mapSoulsWithStatus} = require("../../helpers/fighting-soul-helpers");

module.exports = {
  async execute(interaction) {
    const fighterA = interaction.values[0];
    const fighterB = interaction.user.username;

    const fight = await getFightByFighters(fighterA, fighterB)

    if (!fight) {
      interaction.editReply('This fight cannot be found or has already happened.')
      return;
    }

    const accounts = await getConnectedAccounts(fighterB)
    const wallets = accounts.map(account => account.wallet)

    const allAccountsWithSouls = wallets.map(getOnlySouls)
    Promise.all(allAccountsWithSouls).then(async soulsInAllAccounts => {
      const soulList = soulsInAllAccounts
        .flat()

      if (soulList.length <= 0) {
        await interaction.editReply('You currently have no souls in any of your connected wallets.');
        return;
      }

      const allSoulsWithStatus = await mapStatusToSoul(soulList)

      const sortedSoulsWithStatus = allSoulsWithStatus.sort(soulSorterByStatus)

      const embeds = createChooseSoulFighterEmbeds(sortedSoulsWithStatus);

      const pagination = new Pagination(interaction)
        .setEmbeds(embeds)
        .setEphemeral(true)
        .addActionRows([createSoulFighterMenuRow(sortedSoulsWithStatus, 'choose-fighter-b-menu', fight._id)], ExtraRowPosition.Below);

      await pagination.render();
    })
  },
}
