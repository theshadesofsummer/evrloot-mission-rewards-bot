const {addFightingSoulA} = require("../../evrloot-db");

module.exports = {
  async execute(interaction) {
    const [fightId, soulId] = interaction.values[0].split(';');

    console.log(fightId, soulId)

    await addFightingSoulA(fightId, soulId)

    interaction.reply('let the fight begin')
  },
}
