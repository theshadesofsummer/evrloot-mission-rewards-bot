const {addFightingSoul, getOutstandingInvitationWithSoul, getSoulCooldown} = require("../../evrloot-db");
const {isSoulAvailable} = require("../../helpers/fighting-soul-helpers");
const {postFightAnnouncement} = require("../../discord-client");

module.exports = {
  async execute(interaction) {
    const [fightId, soulId] = interaction.values[0].split(';');

    const isAvailable = await isSoulAvailable(soulId)

    if (!isAvailable) {
      await interaction.reply({
        ephemeral: true,
        content: 'This soul either is on cooldown or in an outstanding invitation, please select another soul.'
      })
      return;
    }

    await addFightingSoul(fightId, soulId, true)

    await interaction.reply({
      ephemeral: true,
      content: 'The invite was successful, now it is up to your opponent to accept the challenge!'
    })

    await postFightAnnouncement(fightId)
  },
}

