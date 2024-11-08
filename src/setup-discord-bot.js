const {REST, Collection} = require('discord.js');
const {Routes} = require('discord-api-types/v9');
const {client, logMessageOrError} = require('./discord-client')
const connectedWalletsCommand = require("./commands/connected-wallets");
const walletSettingsCommand = require("./commands/wallet-settings");
const soulInfoCommand = require('./commands/soul-info.js');
const fightCommand = require('./commands/fight');
const soulInfoSelectMenu = require("./commands/select-menu/soul-info-select-menu.js");
const finishedInviteSelectMenu = require("./commands/select-menu/finished-invite-select-menu");
const finishedAcceptFightSelectMenu = require("./commands/select-menu/finished-accept-fight-select-menu");
const selectedOpponentSelectMenu = require("./commands/select-menu/after-select-opponent")
const showFighterSelectMenu = require("./commands/select-menu/show-fighter-select-menu.js")
const updateUsernameCommand = require('./commands/update-username')
const tournamentCommand = require('./commands/tournament-fight')
const claimableSoulsCommand = require('./commands/claimable-souls')
const newFightCommand = require('./commands/new-fight/new-fight')

module.exports = {
  setupDiscordBot,
};

const commands = [
  connectedWalletsCommand,
  walletSettingsCommand,
  soulInfoCommand,
  //fightCommand,
  tournamentCommand,
  updateUsernameCommand,
  claimableSoulsCommand,
  newFightCommand
]

async function setupDiscordBot() {
  require('dotenv').config({path: '../.env'})

  await deployCommandsToServer();

  client.commands = getCollectionForCommands();
  client.cooldowns = new Collection();


  client.once('ready', () => {
    console.log('Ready!');
  });

  client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {

      try {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        const {cooldowns} = interaction.client;

        if (!cooldowns.has(command.data.name)) {
          cooldowns.set(command.data.name, new Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.data.name);
        const defaultCooldownDuration = 10;
        const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1_000;

        if (timestamps.has(interaction.user.id)) {
          const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

          if (now < expirationTime) {
            const expiredTimestamp = Math.round(expirationTime / 1_000);
            return interaction.reply({
              content: `Please wait, you are on a cooldown for \`/${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`,
              ephemeral: true
            });
          }
        }

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

        try {
          await command.execute(interaction);
        } catch (error) {
          await logMessageOrError('Error executing interaction:',  client.commands.get(interaction.commandName), interaction.user.id)
          await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
        }
      } catch (error) {
        await logMessageOrError('Error while processing interaction:',  client.commands.get(interaction.commandName), interaction.user.id)
      }
    }

    if (interaction.isStringSelectMenu()) {
      try {
        if (interaction.customId === 'choose-soul-menu')
          await soulInfoSelectMenu.execute(interaction)
        else if (interaction.customId === 'choose-fishing-board-menu') {
          // await fishingBoardSelectMenu.execute(interaction)
        } else if (interaction.customId === 'choose-fighter-a-menu')
          await finishedInviteSelectMenu.execute(interaction)
        else if (interaction.customId === 'choose-opponent-menu')
          await selectedOpponentSelectMenu.execute(interaction)
        else if (interaction.customId === 'choose-fighter-b-menu')
          await finishedAcceptFightSelectMenu.execute(interaction)
        else if (interaction.customId === 'show-fighter-menu')
          await showFighterSelectMenu.execute(interaction)
        else {
          interaction.reply({
            ephemeral: true,
            content: 'no matching string select found'
          })
        }

      } catch (error) {
        await logMessageOrError('error while interacting with the string select menu:',  interaction.customId, interaction.user.id)
        await interaction.editReply({content: 'There was an error while interacting with the string select menu!'});
      }
    }
  });

  await client.login(process.env.DISCORDJS_TOKEN);
}

async function deployCommandsToServer() {
  const commandData = []
  for (const command of commands) {
    commandData.push(command.data.toJSON());
  }

  const rest = new REST({version: '10'}).setToken(process.env.DISCORDJS_TOKEN);

  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(process.env.DISCORDJS_CLIENTID),
      {body: commandData},
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
}

function getCollectionForCommands() {
  const collection = new Collection();

  for (const command of commands) {
    collection.set(command.data.name, command);
  }

  return collection;
}
