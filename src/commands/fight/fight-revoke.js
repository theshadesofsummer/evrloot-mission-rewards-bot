const {getOpenInvitationsToYou, getFightByFighters, deleteFight} = require("../../evrloot-db");
const {createChooseOpponentEmbeds} = require("../../embeds/choose-from-select-menu-embeds");
const {Pagination, ExtraRowPosition} = require("pagination.djs");
const {createOpponentSelectMenuRow} = require("../../helpers/select-menu");

module.exports = async function (interaction) {
  const opponent = interaction.options.getUser('opponent');

  const openFight = await getFightByFighters(interaction.user.username, opponent.username);

  if (!openFight) {
    interaction.editReply(`You have no open invitation to ${opponent.username}, you may want to check your sent invitations with \`/fight overview\`.`)
    return;
  }

  await deleteFight(openFight._id)

  let successMessage = `The invitation to the fight against ${opponent.username} was successfully deleted!\n`
  successMessage += openFight.soulA
    ? 'Since you had a soul assigned to the invitation it has been freed and can be selected for another fight.'
    : 'Since you had no soul assigned to the fight there has been no changes made to your set of available fighters.'
  interaction.editReply(successMessage)
}
