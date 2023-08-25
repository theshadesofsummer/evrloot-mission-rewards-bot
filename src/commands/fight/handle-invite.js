const {getFightByFighters, createNewFight, soulIsNotInFight, getConnectedAccounts} = require("../../evrloot-db");
const {getOnlySouls} = require("../../evrloot-api");
const {createChooseSoulEmbeds} = require("../../embeds/choose-from-select-menu-embeds");
const {Pagination, ExtraRowPosition} = require("pagination.djs");
const {createSoulSelectMenuRow} = require("../../helpers/select-menu");

module.exports = async function (interaction, wallets) {
  let opponent = interaction.options.getUser('opponent');

  if (opponent.username === 'Trader Khalil') {
    await interaction.editReply(`Hah you really want to fight me? How foolish of you, go ahead and train more before you challenge me!`)
    return;
  }

  const accountsOfOpponent = await getConnectedAccounts(opponent.username)
  const walletsOfOpponent = accountsOfOpponent.map(account => account.wallet)

  if (!walletsOfOpponent || walletsOfOpponent.length === 0) {
    await interaction.editReply(`Your desired opponent does not have registered wallets!`)
    return;
  }

  let fightId;
  const runningFight = await getFightByFighters(interaction.user.username, opponent.username)
  if (runningFight === null) {
    const insertResult = await createNewFight(interaction.user.username, opponent.username)
    fightId = insertResult.insertedId
  } else {
    fightId = runningFight._id

    if (runningFight.soulA) {
      await interaction.editReply({
        content: `You already have an outgoing invitation to ${runningFight.fighterB} with one of your souls.\n` +
          `Wait for your opponent to accept or withdraw your invitation.`
      })
      return;
    }
  }


  const allAccountsWithSouls = wallets.map(getOnlySouls)
  Promise.all(allAccountsWithSouls).then(async soulsInAllAccounts => {
    const soulList = soulsInAllAccounts
      .flat()

    const availableSouls = await filterAsync(soulList, soulIsNotInFight)

    if (availableSouls.length <= 0) {
      await interaction.editReply('You currently have no souls available for fighting.');
      return;
    }

    const embeds = createChooseSoulEmbeds(availableSouls);

    const pagination = new Pagination(interaction)
      .setEmbeds(embeds)
      .setEphemeral(true)
      .addActionRows([createSoulSelectMenuRow(availableSouls, 'choose-fighter-a-menu', fightId)], ExtraRowPosition.Below);

    await pagination.render();
  })
}

function mapAsync(array, callbackfn) {
  return Promise.all(array.map(callbackfn));
}

async function filterAsync(array, callbackfn) {
  const filterMap = await mapAsync(array, callbackfn);
  return array.filter((value, index) => filterMap[index]);
}

