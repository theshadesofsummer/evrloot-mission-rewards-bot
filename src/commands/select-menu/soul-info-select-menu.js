module.exports = {
  async execute(interaction) {
    const soulId = interaction.values[0];

    console.log('requested', soulId, 'by', interaction.message.interaction.user.username);

    interaction.reply('not working rn')

    // interaction.reply({
    //     embeds: createSoulEmbed(soul, interaction.message.interaction.user),
    // })
  },
}
