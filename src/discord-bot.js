const { Client, REST, Collection } = require('discord.js');
const { Routes } = require('discord-api-types/v9');
const generateSummary = require('./summary/generate-summary.js');
const {verificationMessage} = require("./messaging/verification-message");
const connectedWalletsCommand = require("./commands/connected-wallets");
const walletSettingsCommand = require("./commands/wallet-settings");

module.exports = {
  setupDiscordBot,
  publishSummary,
  postEmbed,
  sendVerificationDm
};

const client = new Client({intents: 0});
const commands = [
  connectedWalletsCommand,
  walletSettingsCommand
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
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
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

async function publishSummary() {
  const channel = await getChannel(client, process.env.STATS_CHANNEL_ID)
  const summary = generateSummary()
  await channel.send(summary);
}

async function postEmbed(embed) {
  const channel = await getChannel(client, process.env.PUBLISH_CHANNEL_ID)
  await channel.send({embeds: [embed]});
}

async function sendVerificationDm(discordId, wallet) {
  await client.guilds.fetch();
  const guild = client.guilds.cache.get(process.env.GUILD_ID);

  // tho only 1 member can be found, it is still a map, don't ask me
  const memberMap = await guild.members.fetch({ query: discordId, limit: 1 })

  await verificationMessage(memberMap, wallet)
}

async function getChannel(client, channelId) {
  await client.guilds.fetch();
  const guild = client.guilds.cache.get(process.env.GUILD_ID);

  await guild.channels.fetch();
  return guild.channels.cache.get(channelId);
}