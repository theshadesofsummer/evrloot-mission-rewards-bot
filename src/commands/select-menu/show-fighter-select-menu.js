const {addFightingSoul, getOutstandingInvitationWithSoul, getSoulCooldown} = require("../../evrloot-db");
const {isSoulAvailable} = require("../../helpers/fighting-soul-helpers");
const {addSoulToFightPool} = require("../new-fight/add-soul-to-fight-pool");

module.exports = {
  async execute(interaction) {
    const [soulId] = interaction.values;

    await interaction.deferReply({ephemeral: true})
    await interaction.editReply('<a:Doubloon:1256636404658602076> Fetching Soul Info')

    const isAvailable = await isSoulAvailable(soulId)

    if (!isAvailable) {
      await interaction.editReply('This soul either is on cooldown or already in the pool waiting for an opponent, please select another soul.')
      return;
    }

    await addSoulToFightPool(interaction, soulId)
  },
}

