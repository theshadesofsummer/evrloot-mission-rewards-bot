const {addFightingSoul} = require("../../evrloot-db");
const handleFight = require('../fight/handle-fight')

module.exports = {
  async execute(interaction) {
    const [fightId, soulId] = interaction.values[0].split(';');

    await addFightingSoul(fightId, soulId, true)

    await interaction.reply({
      ephemeral: true,
      content: 'The invite was successful, now it is up to your opponent to accept the challenge!'
    })
  },
}
