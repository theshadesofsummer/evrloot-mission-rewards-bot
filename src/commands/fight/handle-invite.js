const {getFightByFighters, createNewFight, soulIsNotInFight, getConnectedWallets} = require("../../evrloot-db");
const {getOnlySouls} = require("../../evrloot-api");
const {createChooseSoulEmbeds} = require("../../embeds/choose-from-select-menu-embeds");
const {Pagination, ExtraRowPosition} = require("pagination.djs");
const {createSoulSelectMenuRow} = require("../../helpers/select-menu");

module.exports = async function (interaction, wallets) {
  let opponent = interaction.options.getUser('opponent');

  const opponentIsConnected = await getConnectedWallets(opponent.username)

  let fightId;
  const runningFight = await getFightByFighters(interaction.user.username, opponent.username)
  if (runningFight === null) {
    console.log('need to create a new fight')
    const insertResult = await createNewFight(interaction.user.username, opponent.username)
    fightId = insertResult.insertedId
  } else {
    console.log('running fight found')
    fightId = runningFight._id

    if (runningFight.soulA) {
      interaction.editReply({
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

    if (availableSouls.length <= 0)
      interaction.editReply('You currently have no souls available for fighting.')

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

