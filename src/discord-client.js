const {Client} = require("discord.js");
const generateSummary = require("./summary/generate-summary");
const {deleteWallet} = require("./evrloot-db");
const {verificationMessage} = require("./messaging/verification-message");

const client = new Client({intents: 0});

module.exports = {
  client,
  publishSummary,
  postEmbed,
  postFightResult,
  sendVerificationDm
}


async function publishSummary() {
  console.log('[BOT] publish summary')
  const channel = await getChannel(client, process.env.STATS_CHANNEL_ID)
  const summary = generateSummary()
  await channel.send(summary);
}

async function postEmbed(embed) {
  console.log('[BOT] publish embed')
  const channel = await getChannel(client, process.env.PUBLISH_CHANNEL_ID)
  await channel.send({embeds: [embed]});
}

async function postFightResult(embed) {
  console.log('[BOT] publish fight result')
  const channel = await getChannel(client, process.env.ARENA_CHANNEL_ID)
  return await channel.send({embeds: [embed]});
}

async function sendVerificationDm(discordName, wallet) {
  await client.guilds.fetch();
  const guild = client.guilds.cache.get(process.env.GUILD_ID);

  const memberMap = await guild.members.fetch({ query: discordName, limit: 10})

  let userWithMatchingUsername = undefined;
  memberMap.forEach(member => {
    const username = member.user.username;
    if (username === discordName.toLowerCase()) {
      userWithMatchingUsername = member;
    }
  })

  if (!userWithMatchingUsername) {
    await deleteWallet(wallet)
  } else {
    await verificationMessage(userWithMatchingUsername, wallet)
  }
}

async function getChannel(client, channelId) {
  await client.guilds.fetch();
  const guild = client.guilds.cache.get(process.env.GUILD_ID);

  await guild.channels.fetch();
  return guild.channels.cache.get(channelId);
}
