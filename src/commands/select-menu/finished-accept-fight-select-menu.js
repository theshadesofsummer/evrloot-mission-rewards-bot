const {addFightingSoul} = require("../../evrloot-db");
const handleFight = require('../fight/handle-fight')

module.exports = {
  async execute(interaction) {
    const [fightId, soulId] = interaction.values[0].split(';');

    await addFightingSoul(fightId, soulId, false)

    await interaction.reply({
      ephemeral: true,
      content: `Thanks, the fight will happen now and the results will be published in <#${process.env.ARENA_CHANNEL_ID}>`
    })

    await handleFight(interaction, fightId)
  },
}
