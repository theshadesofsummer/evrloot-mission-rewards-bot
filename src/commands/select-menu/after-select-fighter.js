const {addFightingSoul} = require("../../evrloot-db");

module.exports = {
  async execute(interaction, firstFighter) {
    const [fightId, soulId] = interaction.values[0].split(';');

    console.log(fightId, soulId, 'firstFighter', firstFighter)

    await addFightingSoul(fightId, soulId, firstFighter)

    interaction.reply({
      ephemeral: true,
      content: 'Your soul will await your opponents decision'
    })
  },
}
