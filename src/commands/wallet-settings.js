const {SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder} = require("discord.js");
const {userWithWallet, updateDocument, deleteWallet} = require("../evrloot-db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wallet-settings')
    .setDescription('Change what others see or cannot see!')
    .addStringOption(option =>
      option.setName('address')
        .setDescription('Put in the moonbeam address of your wallet (0x...)')
        .setRequired(true)
        .setMaxLength(42)
        .setMinLength(42)
    ),
  async execute(interaction) {

    const address = interaction.options.getString('address')
    const username = interaction.user.globalName
    const entry = await userWithWallet(username, address)

    if (entry === null || entry === undefined) {
      await interaction.reply({
        ephemeral: true,
        content: `Sorry, I don't think i recall that combination, are you sure you ever approved this address?`
      })
    } else {
      const walletSettingMessage = await interaction.reply({
        ephemeral: true,
        content: `Ah yes, here is your entry! So what do you want to do with it?`,
        components: [walletSettingsRow(entry)]
      })

      try {
        const confirmation = await walletSettingMessage.awaitMessageComponent({ time: 60_000 });

        if (confirmation.customId === 'wallet-nothing') {
          await confirmation.update({ components: [] });
          await interaction.followUp({
            ephemeral: true,
            content: 'No problem, I will always be glad to help you.'
          })
        } else if (confirmation.customId === 'wallet-toggle-anon') {
          await updateDocument({wallet: address}, {isAnonymous: !entry.isAnonymous})

          await confirmation.update({ components: [] });
          await interaction.followUp({
            ephemeral: true,
            content: 'I successfully toggled your anonymity, you are now ' + getAnonState(!entry.isAnonymous),
          })
        } else if (confirmation.customId === 'wallet-delete') {
          await deleteWallet(address)

          await confirmation.update({ components: [] });
          await interaction.followUp({
            ephemeral: true,
            content: 'I successfully deleted this information, I will burn that piece of paper right now',
          })
        }


      } catch (e) {
        console.log('user did not react on the setting command or some error happened:', e)

        await interaction.followUp({
          ephemeral: true,
          content: 'Indecisive? Do not worry, I will be here for you if you made up your mind.'
        });
      }
    }
  },
};

function walletSettingsRow(entry) {
  const nothingButton = new ButtonBuilder()
    .setCustomId('wallet-nothing')
    .setLabel('Nothing, thank you')
    .setStyle(ButtonStyle.Secondary);

  const toggleAnonButton = new ButtonBuilder()
    .setCustomId('wallet-toggle-anon')
    .setLabel('Toggle Anonymity, currently ' + getAnonState(entry.isAnonymous)+ '.')
    .setStyle(ButtonStyle.Primary);

  const deleteButton = new ButtonBuilder()
    .setCustomId('wallet-delete')
    .setLabel('Please remove my entry!')
    .setStyle(ButtonStyle.Danger);

  return new ActionRowBuilder()
    .addComponents(nothingButton, toggleAnonButton, deleteButton);
}

function getAnonState(isAnonymous) {
  return isAnonymous ? 'undercover' : 'public'
}