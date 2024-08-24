const {SlashCommandBuilder} = require("discord.js");
const {getAllConnectedAccounts} = require("../evrloot-db");


module.exports = {
  data: new SlashCommandBuilder()
    .setName('connected-wallets')
    .setDescription('See what addresses you have connected!'),
  async execute(interaction) {
    await interaction.deferReply({
      ephemeral: true
    })

    const userId = interaction.user.id
    const accounts = await getAllConnectedAccounts(userId)

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

function messageContent(accounts) {
  const walletList = accounts.map(accountEntry).join('\n')
  return `Hello Traveller, i searched my personal safe and found the following addresses associated to your name:\n` +
    walletList +
    '\n\n You can always change the individual settings with `/wallet-settings address`'
}

function accountEntry(account, idx) {
  return `${idx + 1}. ${account.wallet}\n\tverified: ${account.verified ? '✅' : '❎ '}\n\tanonymous: ${account.isAnonymous ? '✅' : '❎'}`
}