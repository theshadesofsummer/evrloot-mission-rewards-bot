const {getOpenPoolFight, createNewFightInPool, addFighterToOpenPoolFight} = require("../../evrloot-db")
const handleFight = require('../fight/handle-fight')

module.exports = {
  addSoulToFightPool
}

async function addSoulToFightPool(interaction, soulId) {
  await interaction.editReply('<a:Doubloon:1256636404658602076> Checking for an open fight')

  let openPoolFight = await getOpenPoolFight(interaction.user.id)

  if (!openPoolFight) {
    console.log('no open pool fight > create one')
    await createNewFightInPool(soulId, interaction.user.id)

    await interaction.editReply('Your soul was added to the pool of fighters and will match the next opponent!')
  } else {
    await interaction.editReply('<a:Doubloon:1256636404658602076> Found an opponent, preparing fight')

    openPoolFight = await addFighterToOpenPoolFight(openPoolFight._id, soulId, interaction.user.id)

    console.log('openPoolFight before fight', openPoolFight)

    handleFight(interaction, openPoolFight)
  }
}