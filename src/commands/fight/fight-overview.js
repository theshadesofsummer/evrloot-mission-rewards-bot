const {getOpenInvitationsToYou, getOpenInvitationsFromYou} = require("../../evrloot-db");
const createOpenFightsEmbed = require("../../embeds/open-fights-embed");

module.exports = async function (interaction) {
  const userId = interaction.user.id;

  const receivedInvitations = await getOpenInvitationsToYou(userId);
  const sendInvitationsWithoutSoul = await getOpenInvitationsFromYou(userId, false);
  const sendInvitationsWithSoul = await getOpenInvitationsFromYou(userId, true);

  const embed = createOpenFightsEmbed(receivedInvitations, sendInvitationsWithoutSoul, sendInvitationsWithSoul);

  await interaction.editReply({
    embeds: [embed]
  })
}
