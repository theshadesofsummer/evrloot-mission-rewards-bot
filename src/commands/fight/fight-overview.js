const {getOpenInvitationsToYou, getOpenInvitationsFromYou} = require("../../evrloot-db");
const createOpenFightsEmbed = require("../../embeds/open-fights-embed");
const {Pagination, ExtraRowPosition} = require("pagination.djs");
const {createOpponentSelectMenuRow} = require("../../helpers/select-menu");

module.exports = async function (interaction) {
  const username = interaction.user.username;

  const receivedInvitations = await getOpenInvitationsToYou(username);
  const sendInvitationsWithoutSoul = await getOpenInvitationsFromYou(username, false);
  const sendInvitationsWithSoul = await getOpenInvitationsFromYou(username, true);

  const embed = createOpenFightsEmbed(receivedInvitations, sendInvitationsWithoutSoul, sendInvitationsWithSoul);

  await interaction.editReply({
    embeds: [embed]
  })
}
