const { Client, ButtonStyle, ActionRowBuilder, ButtonBuilder} = require('discord.js');
const generateSummary = require('./summary/generate-summary.js')
const {updateDocument, deleteDocument} = require("./evrloot-db");
const {verificationMessage} = require("./messaging/verification-message");

module.exports = {
  setupDiscordBot,
  publishSummary,
  postEmbed,
  sendVerificationDm
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