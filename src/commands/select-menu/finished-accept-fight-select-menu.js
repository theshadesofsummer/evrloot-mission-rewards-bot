const {addFightingSoul} = require("../../evrloot-db");
const handleFight = require('../fight/handle-fight')
const {isSoulAvailable} = require("../../helpers/fighting-soul-helpers");

module.exports = {
  async execute(interaction) {
    const [fightId, soulId] = interaction.values[0].split(';');

    const isAvailable = await isSoulAvailable(soulId)

    if (!isAvailable) {
      await interaction.reply({
        ephemeral: true,
        content: 'This soul either is on cooldown or in an outstanding invitation, please select another soul.'
      })
    }

    await addFightingSoul(fightId, soulId, false)

    await interaction.reply({
      ephemeral: true,
      content: `Thanks, the fight will happen now and the results will be published in <#${process.env.ARENA_CHANNEL_ID}>`
    })

    await handleFight(interaction, fightId)
  },
}
