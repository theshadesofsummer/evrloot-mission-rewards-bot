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
  const channel = await getChannel(client, process.env.STATS_CHANNEL_ID)
  const summary = generateSummary()
  await channel.send(summary);
}

async function postEmbed(embed) {
  const channel = await getChannel(client, process.env.PUBLISH_CHANNEL_ID)
  await channel.send({embeds: [embed]});
}

async function postFightResult(embed) {
  const channel = await getChannel(client, process.env.ARENA_CHANNEL_ID)
  return await channel.send({embeds: [embed]});
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
    await deleteWallet(wallet)
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