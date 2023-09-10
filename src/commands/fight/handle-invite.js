const {getFightByFighters, createNewFight, getConnectedAccounts} = require("../../evrloot-db");
const {getOnlySouls} = require("../../evrloot-api");
const {createChooseSoulFighterEmbeds} = require("../../embeds/choose-from-select-menu-embeds");
const {Pagination, ExtraRowPosition} = require("pagination.djs");
const {createSoulFighterMenuRow} = require("../../helpers/select-menu");
const {mapStatusToSoul, soulSorterByStatus} = require("../../helpers/fighting-soul-helpers");

module.exports = async function (interaction, wallets) {
  let opponent = interaction.options.getUser('opponent');

  if (opponent.username === 'Trader Khalil') {
    await interaction.editReply(`Hah you really want to fight me? How foolish of you, go ahead and train more before you challenge me!`)
    return;
  }

  const accountsOfOpponent = await getConnectedAccounts(opponent.id)
  const walletsOfOpponent = accountsOfOpponent.map(account => account.wallet)

  if (!walletsOfOpponent || walletsOfOpponent.length === 0) {
    await interaction.editReply(`Your desired opponent does not have registered wallets!`)
    return;
  }

  let fightId;
  const runningFight = await getFightByFighters(interaction.user.id, opponent.id)
  if (runningFight === null) {
    const insertResult = await createNewFight(interaction.user.id, opponent.id)
    fightId = insertResult.insertedId
  } else {
    fightId = runningFight._id

    if (runningFight.soulA) {
      await interaction.editReply({
        content: `You already have an outgoing invitation to <@${runningFight.fighterB}> with one of your souls.\n` +
          `Wait for your opponent to accept or withdraw your invitation.`
      })
      return;
    }
  }


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
      .addActionRows([createSoulFighterMenuRow(sortedSoulsWithStatus, 'choose-fighter-a-menu', fightId)], ExtraRowPosition.Below);

    await pagination.render();
  })
}

