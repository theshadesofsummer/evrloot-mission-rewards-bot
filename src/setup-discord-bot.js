const {  REST, Collection } = require('discord.js');
const { Routes } = require('discord-api-types/v9');
const {client} = require('./discord-client')
const connectedWalletsCommand = require("./commands/connected-wallets");
const walletSettingsCommand = require("./commands/wallet-settings");
const soulInfoCommand = require('./commands/soul-info.js');
const fightCommand = require('./commands/fight');
const soulInfoSelectMenu = require("./commands/select-menu/soul-info-select-menu.js");
const finishedInviteSelectMenu = require("./commands/select-menu/finished-invite-select-menu");
const finishedAcceptFightSelectMenu = require("./commands/select-menu/finished-accept-fight-select-menu");
const selectedOpponentSelectMenu = require("./commands/select-menu/after-select-opponent")
const updateUsernameCommand = require('./commands/update-username')
const tournamentCommand = require('./commands/tournament-fight')
const claimableSoulsCommand = require('./commands/claimable-souls')

module.exports = {
  setupDiscordBot,
};

const commands = [
  connectedWalletsCommand,
  walletSettingsCommand,
  soulInfoCommand,
  fightCommand,
  tournamentCommand,
  updateUsernameCommand,
  claimableSoulsCommand
]

async function setupDiscordBot() {
  require('dotenv').config({path: '../.env'})

  await deployCommandsToServer();

  client.commands = getCollectionForCommands();

  client.once('ready', () => {
    console.log('Ready!');
  });

  client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
      try {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
          await command.execute(interaction);
        } catch (error) {
          console.error(error);
          await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
        }
      } catch (error) {
        console.warn('error while interaction:', error)
      }
    }

    if (interaction.isStringSelectMenu()) {
      try {
        console.log('>>> string select menu', interaction.customId, interaction.values[0], interaction.user.id)
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
        else {
          interaction.reply({
            ephemeral: true,
            content: 'no matching string select found'
          })
        }

      }
      catch (error) {
        console.log(error);
        await interaction.editReply({ content: 'There was an error while interacting with the string select menu!' });
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

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORDJS_TOKEN);

  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(process.env.DISCORDJS_CLIENTID),
      { body: commandData },
    );

    console.log('Successfully reloaded application (/) commands.');
  }
  catch (error) {
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
