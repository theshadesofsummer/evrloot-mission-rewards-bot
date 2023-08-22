const {SlashCommandBuilder} = require("discord.js");
const {getConnectedWallets} = require("../evrloot-db");
const {getOnlySouls} = require("../evrloot-api");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fight')
    .setDescription('Pick one of your souls to fight against your friends or (soon to be) enemies!')
    .addSubcommand(subcommand =>
      subcommand.setName('invite')
        .setDescription('Start a challenge and wait for your opponent to accept or refuse.')
        .addUserOption(option =>
          option.setName('opponent')
            .setDescription('Your counterpart on the battlefield')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand.setName('accept')
        .setDescription('tbd!')
    ),
  async execute(interaction) {
    await interaction.deferReply({
      ephemeral: true
    })

    const username = interaction.user.username
    const accounts = await getConnectedWallets({discordId: username})

    if (!accounts || accounts.length <= 0) {
      await interaction.editReply({
        content: `To have access to your souls you need to connect your wallet(s) to your discord account!`
      })
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'invite') {
      let opponent = interaction.options.getUser('opponent');

      accounts.map(getOnlySouls)

    }

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
