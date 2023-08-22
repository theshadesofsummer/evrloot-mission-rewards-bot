const {getConnectedWallets, soulIsNotInFight, getFightByFighters} = require("../../evrloot-db");
const {getOnlySouls} = require("../../evrloot-api");
const {createChooseSoulEmbeds} = require("../../embeds/choose-from-select-menu-embeds");
const {Pagination, ExtraRowPosition} = require("pagination.djs");
const {createSoulSelectMenuRow} = require("../../helpers/select-menu");

module.exports = {
  async execute(interaction, firstFighter) {
    const fighterA = interaction.values[0];
    const fighterB = interaction.user.username;

    const fight = await getFightByFighters(fighterA, fighterB)

    const wallets = await getConnectedWallets({discordId: fighterB})

    const allAccountsWithSouls = wallets.map(getOnlySouls)
    Promise.all(allAccountsWithSouls).then(async soulsInAllAccounts => {
      const soulList = soulsInAllAccounts
        .flat()

      const availableSouls = await filterAsync(soulList, soulIsNotInFight)

      if (availableSouls.length <= 0)
        interaction.editReply('You currently have no souls available for fighting,')

      const embeds = createChooseSoulEmbeds(availableSouls);

      const pagination = new Pagination(interaction)
        .setEmbeds(embeds)
        .setEphemeral(true)
        .addActionRows([createSoulSelectMenuRow(availableSouls, 'choose-fighter-b-menu', fight._id)], ExtraRowPosition.Below);

      await pagination.render();
    })
  },
}

function mapAsync(array, callbackfn) {
  return Promise.all(array.map(callbackfn));
}

async function filterAsync(array, callbackfn) {
  const filterMap = await mapAsync(array, callbackfn);
  return array.filter((value, index) => filterMap[index]);
}

