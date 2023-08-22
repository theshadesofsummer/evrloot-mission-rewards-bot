const {addFightingSoul} = require("../../evrloot-db");
const handleFight = require('../fight/handle-fight')

module.exports = {
  async execute(interaction, firstFighter) {
    const [fightId, soulId] = interaction.values[0].split(';');

    console.log(fightId, soulId, 'firstFighter', firstFighter)

    await addFightingSoul(fightId, soulId, firstFighter)

    await interaction.reply({
      ephemeral: true,
      content: 'Thanks, the fight will happen soon!'
    })

    // error handling like shit needs to be done here
    if (!firstFighter) {
      await handleFight(interaction, fightId)
    }

  },
}
