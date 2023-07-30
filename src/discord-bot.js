const { Client } = require('discord.js');
const generateSummary = require('./summary/generate-summary.js')

module.exports = {
  setupDiscordBot,
  publishSummary,
  postEmbed,
};

const client = new Client({intents: 0});

async function setupDiscordBot() {
  require('dotenv').config({path: '../.env'})

  client.once('ready', () => {
    console.log('Ready!');
  });

  await client.login(process.env.DISCORDJS_TOKEN);
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

async function getChannel(client, channelId) {
  await client.guilds.fetch();
  const guild = client.guilds.cache.get(process.env.GUILD_ID);

  await guild.channels.fetch();
  return guild.channels.cache.get(channelId);
}