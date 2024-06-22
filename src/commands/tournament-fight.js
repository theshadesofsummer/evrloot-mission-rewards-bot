const {SlashCommandBuilder} = require("discord.js");
const {createNewFight, addFightingSoul, getFightByFightId} = require("../evrloot-db");
const handleFight = require('./fight/handle-fight')
const config = require("../config");
const {postTournamentStart, postTournamentStop} = require("../discord-client");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tournament-settings')
    .setDescription('Tournament related commands, not for general use!')
    .addSubcommand(subcommand =>
      subcommand.setName('start')
        .setDescription('Start the tournament as one of the tournament managers')
    )
    .addSubcommand(subcommand =>
      subcommand.setName('stop')
        .setDescription('Pause the tournament as one of the tournament managers')
    )
    .addSubcommand(subcommand =>
      subcommand.setName('fight')
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
        )
    ),
  async execute(interaction) {
    await interaction.deferReply({
      ephemeral: true
    })

    if (!isUserAllowed(interaction.user.id)) {
      await interaction.editReply({ content: 'You are not allowed to use this command!', ephemeral: true });
      return;
    } else {
      await interaction.editReply({ content: 'Authorized, preparing further action!', ephemeral: true });
    }

    const subcommand = interaction.options.getSubcommand();
    if (subcommand === 'start') {
      await startTournament(interaction)
    } else if (subcommand === 'stop') {
      await stopTournament(interaction)
    } else if (subcommand === 'fight') {
      await startManualFight(interaction)
    }


  },
};

const isUserAllowed = userId =>
  config.tournament.allowedUserIDs.includes(userId);

async function startTournament(interaction) {
  const isTournamentStarted = config.tournament.started;

  if (isTournamentStarted) {
    interaction.editReply({content: 'The tournament is already running, no action was taken', ephemeral: true})
  } else {
    config.tournament.started = true;
    interaction.editReply({content: 'The tournament is has now started, message will be published in arena', ephemeral: true})
    await postTournamentStart();
  }
}

async function stopTournament(interaction) {
  const isTournamentStarted = config.tournament.started;

  if (!isTournamentStarted) {
    interaction.editReply({content: 'The tournament is already stopped, no action was taken', ephemeral: true})
  } else {
    config.tournament.started = false;
    interaction.editReply({content: 'The tournament is has now stopped, message will be published in arena', ephemeral: true})
    await postTournamentStop();
  }
}

async function startManualFight(interaction) {
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
}