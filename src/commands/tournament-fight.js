const {SlashCommandBuilder} = require("discord.js");
const {createNewFight, addFightingSoul} = require("../evrloot-db");
const handleFight = require('./fight/handle-fight')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tournament-fight')
    .setDescription('Manually trigger a tournament fight, only possible by team members!')
    .addUserOption(option =>
      option.setName('attacker')
        .setDescription('This user is the attacker in this fight.')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('attacker-soul-id')
        .setDescription('Number (ID) of the attacking soul')
        .setRequired(true)
    )
    .addUserOption(option =>
      option.setName('defender')
        .setDescription('This user is the defender in this fight.')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('defender-soul-id')
        .setDescription('Number (ID) of the defending soul')
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply({
      ephemeral: true
    })

    if (!isUserAllowed(interaction.user.id)) {
      await interaction.reply({ content: 'You are not allowed to use this command!', ephemeral: true });
      return;
    }

    const attackerDiscordId = interaction.options.getUser('attacker').id;
    const defenderDiscordId = interaction.options.getUser('defender').id;

    const attackerSoulId = 'EVR-SOULS-' + interaction.options.getInteger('attacker-soul-id');
    const defenderSoulId = 'EVR-SOULS-' + interaction.options.getInteger('defender-soul-id');

    const newFight = await createNewFight(attackerDiscordId, defenderDiscordId);
    await addFightingSoul(newFight._id, attackerSoulId, true);
    await addFightingSoul(newFight._id, attackerSoulId, defenderSoulId);

    await handleFight(interaction, newFight._id)
  },
};

const allowedUserIDs = [
  '459760677935120384', //summer
  '392742443650646017'  //luuu
]
const isUserAllowed = userId =>
  allowedUserIDs.includes(userId);