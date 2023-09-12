const {getFightByFighters, deleteFight} = require("../../evrloot-db");

module.exports = async function (interaction) {
  const opponent = interaction.options.getUser('opponent');

  const openFight = await getFightByFighters(interaction.user.id, opponent.id);

  if (!openFight) {
    interaction.editReply(`You have no open invitation to <@${opponent.id}>.\nYou may want to check your sent invitations with \`/fight overview\`.`)
    return;
  }

  await deleteFight(openFight._id)

  let successMessage = `The invitation to the fight against <@${opponent.id}> was successfully deleted!\n`
  successMessage += openFight.soulA
    ? 'Since you had a soul assigned to the invitation it has been freed and can be selected for another fight.'
    : 'Since you had no soul assigned to the fight there has been no changes made to your set of available fighters.'
  interaction.editReply(successMessage)
}
