const {SlashCommandBuilder} = require("discord.js");
const {createNewFight, addFightingSoul, getFightByFightId} = require("../evrloot-db");
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
      await interaction.editReply({ content: 'You are not allowed to use this command!', ephemeral: true });
      return;
    } else {
      await interaction.editReply({ content: 'Authorized, preparing fight object!', ephemeral: true });
    }

    const attackerDiscordId = interaction.options.getUser('attacker').id;
    const defenderDiscordId = interaction.options.getUser('defender').id;

    const attackerSoulId = 'EVR-SOULS-' + interaction.options.getInteger('attacker-soul-id');
    const defenderSoulId = 'EVR-SOULS-' + interaction.options.getInteger('defender-soul-id');

    const newFight = await createNewFight(attackerDiscordId, defenderDiscordId);
    const fightId = newFight.insertedId

    await addFightingSoul(fightId, attackerSoulId, true);
    await addFightingSoul(fightId, defenderSoulId, false);

    await interaction.editReply({ content: 'initialized fight; starting battle!', ephemeral: true });

    const fightObj = await getFightByFightId(fightId.toString())
    console.log(attackerSoulId, defenderSoulId, fightObj)

    await handleFight(fightId.toString())

    await interaction.editReply({ content: 'fight finished!', ephemeral: true });
  },
};

const allowedUserIDs = [
  '459760677935120384', //summer
  '392742443650646017'  //luuu
]
const isUserAllowed = userId =>
  allowedUserIDs.includes(userId);