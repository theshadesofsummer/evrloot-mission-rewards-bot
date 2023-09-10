const {getOpenInvitationsToYou} = require("../../evrloot-db");
const {createChooseOpponentEmbeds} = require("../../embeds/choose-from-select-menu-embeds");
const {Pagination, ExtraRowPosition} = require("pagination.djs");
const {createOpponentSelectMenuRow} = require("../../helpers/select-menu");

module.exports = async function (interaction) {
  const openInvitations = await getOpenInvitationsToYou(interaction.user.id);

  if (!openInvitations || openInvitations.length <= 0) {
    interaction.editReply('You currently have no incoming fight requests! You might want to send some invites yourself.')
    return;
  }

  const opponents = openInvitations.map(fight => fight.fighterA)

  const embeds = createChooseOpponentEmbeds(opponents);

  const pagination = new Pagination(interaction)
    .setEmbeds(embeds)
    .setEphemeral(true)
    .addActionRows([createOpponentSelectMenuRow(opponents, 'choose-opponent-menu')], ExtraRowPosition.Below);

  await pagination.render();
}
