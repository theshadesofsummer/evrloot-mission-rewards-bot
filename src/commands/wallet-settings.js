const {SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder} = require("discord.js");
const {userWithWallet, updateDocument, deleteDocument} = require("../evrloot-db");

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
    interaction.deferReply({
      ephemeral: true
    })

    const address = interaction.options.getString('address')
    const username = 'summershades'
    const entry = await userWithWallet({discordId: username, wallet: address})

    if (entry === null || entry === undefined) {
      await interaction.editReply({
        ephemeral: true,
        content: `Sorry, I don't think i recall that combination, are you sure you ever approved this address?`
      })
    } else {
      const walletSettingMessage = await interaction.editReply({
        ephemeral: true,
        content: `Ah yes, here is your entry! So what do you want to do with it?`,
        components: walletSettingsRow(entry)
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
            content: 'I successfully toggled your anonymity, traveller.',
          })
        } else if (confirmation.customId === 'wallet-delete') {
          await deleteDocument({wallet: address})

          await confirmation.update({ components: [] });
          await interaction.followUp({
            ephemeral: true,
            content: 'Successfully deleted your wallet, I will burn that piece of paper right now',
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
    .setLabel('Toggle Anonymity, currently ' + getAnonState(entry))
    .setStyle(ButtonStyle.Primary);

  const deleteButton = new ButtonBuilder()
    .setCustomId('wallet-delete')
    .setLabel('No thanks, i rather want to stay undercover!')
    .setStyle(ButtonStyle.Danger);

  return new ActionRowBuilder()
    .addComponents(nothingButton, toggleAnonButton, deleteButton);
}

function getAnonState(entry) {
  return entry.isAnonymous ? 'undercover' : 'public'
}