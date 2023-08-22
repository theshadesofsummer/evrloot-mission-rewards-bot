const { Client, REST, Collection } = require('discord.js');
const { Routes } = require('discord-api-types/v9');
const generateSummary = require('./summary/generate-summary.js');
const {verificationMessage} = require("./messaging/verification-message");
const connectedWalletsCommand = require("./commands/connected-wallets");
const walletSettingsCommand = require("./commands/wallet-settings");
const soulInfoCommand = require('./commands/soul-info.js');
const fightCommand = require('./commands/fight');
const {deleteDocument} = require("./evrloot-db");
const soulInfoSelectMenu = require("./commands/select-menu/soul-info-select-menu.js");
const selectedFighterSelectMenu = require("./commands/select-menu/select-fighter");


module.exports = {
  setupDiscordBot,
  publishSummary,
  postEmbed,
  sendVerificationDm
};

const client = new Client({intents: 0});
const commands = [
  connectedWalletsCommand,
  walletSettingsCommand,
  soulInfoCommand,
  fightCommand
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

    if (interaction.isStringSelectMenu()) {
      try {
        if (interaction.customId === 'choose-soul-menu')
          await soulInfoSelectMenu.execute(interaction)
        else if (interaction.customId === 'choose-fishing-board-menu') {
          // await fishingBoardSelectMenu.execute(interaction)
        } else if (interaction.customId === 'choose-fighter-a-menu')
          await selectedFighterSelectMenu.execute(interaction, true)
        else if (interaction.customId === 'choose-fighter-b-menu')
          await selectedFighterSelectMenu.execute(interaction, false)
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

  const memberMap = await guild.members.fetch({ query: discordId, limit: 10})

  let userWithMatchingUsername = undefined;
  memberMap.forEach(member => {
    const username = member.user.username;
    console.log('found possible user named', username)
    if (username === discordId) {
      userWithMatchingUsername = member;
    }
  })

  if (!userWithMatchingUsername) {
    console.log('could not find member for', discordId)
    await deleteDocument({wallet})
  } else {
    console.log('found member for', discordId)
    await verificationMessage(userWithMatchingUsername, wallet)
  }
}

async function getChannel(client, channelId) {
  await client.guilds.fetch();
  const guild = client.guilds.cache.get(process.env.GUILD_ID);

  await guild.channels.fetch();
  return guild.channels.cache.get(channelId);
}