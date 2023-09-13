const {SlashCommandBuilder} = require("discord.js");
const {getAllConnectedAccounts, updateDiscordName} = require("../evrloot-db");


module.exports = {
  data: new SlashCommandBuilder()
    .setName('update-username')
    .setDescription('Update your username if you changed it previously!'),
  async execute(interaction) {
    await interaction.deferReply({
      ephemeral: true
    })

    const userId = interaction.user.id
    const accounts = await getAllConnectedAccounts(userId, false)

    if (!accounts || accounts.length <= 0) {
      await interaction.editReply({
        content: `I couldn't find any accounts that belong to you, I'm sorry.`
      })
      return;
    }

    const currentUserName = interaction.user.username;
    const accountsWithOutdatedNames = accounts.filter(account => account.discordName !== currentUserName)
    if (accountsWithOutdatedNames.length > 0) {
      for (const oldAccount of accountsWithOutdatedNames) {
        await updateDiscordName(oldAccount._id, currentUserName);
      }
      await interaction.editReply({
        content: `Your usernames have been updated, thanks!`
      })
    } else {
      await interaction.editReply({
        content: `All of your connected accounts have your current username \`${currentUserName}\`, no changes were made.`
      })
    }
  },
};
