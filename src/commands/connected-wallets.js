const {SlashCommandBuilder} = require("discord.js");
const {getConnectedWallets} = require("../evrloot-db");


module.exports = {
  data: new SlashCommandBuilder()
    .setName('connected-wallets')
    .setDescription('See what addresses you have connected!'),
  async execute(interaction) {
    await interaction.deferReply({
      ephemeral: true
    })

    const username = interaction.user.username
    const accounts = await getConnectedWallets({discordId: username})

    if (!accounts || accounts.length <= 0) {
      await interaction.editReply({
        content: `I couldn't find anything with your name on it, I'm sorry.`
      })
    } else {
      await interaction.editReply({
        content: messageContent(accounts)
      })
    }
  },
};

function messageContent(wallets) {
  const walletList = wallets.map(wallet => `\`${wallet}\`\n`)
  return `Hello Traveller, i searched my personal safe and found the following addresses associated to your name:\n` +
    walletList
}