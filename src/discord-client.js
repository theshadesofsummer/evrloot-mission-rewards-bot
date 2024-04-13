const {Client} = require("discord.js");
const generateSummary = require("./summary/generate-summary");
const {deleteWallet, getFightByFightId} = require("./evrloot-db");
const {verificationMessage} = require("./messaging/verification-message");

const client = new Client({intents: 0});

module.exports = {
  client,
  publishSummary,
  postEmbed,
  postFightResult,
  postFightAnnouncement,
  postTournamentStart,
  postTournamentStop,
  postResourceReveal,
  postPotionReveal,
  postNewTrade,
  sendVerificationDm,
  mapClientIdToName,
  getUserByClientId
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

async function postFightAnnouncement(fightId) {
  console.log('[BOT] publish fight announcement')
  const fight = await getFightByFightId(fightId)

  const channel = await getChannel(client, process.env.ARENA_CHANNEL_ID)
  return await channel.send({
    content: `<@${fight.fighterA}> has challenged <@${fight.fighterB}> to a fight!`
  });
}

async function postTournamentStart() {
  const channel = await getChannel(client, process.env.ARENA_CHANNEL_ID)
  return await channel.send({
    content: `# The tournament has been started!\n`
          + 'Prove your worth among the ranks of your fellow souls, only the best ones may ascend into the finals.\n'
          + 'Initiate the combat with the `/fight` commands. Use `/fight invite` to invite other players, '
          + '`/fight accept` to accept other peoples invitation and `/fight overview` if you were away and want to check'
          + ' incoming outgoing fight requests.\n'
          + 'You can check the best souls with `/fight leaderboard`\n\n'
          + 'Good Luck out there, you will need it.'
  });
}

async function postTournamentStop() {
  const channel = await getChannel(client, process.env.ARENA_CHANNEL_ID)
  return await channel.send({
    content: `# The public phase of the tournament has ended!\n`
      + 'From now on only the top 8 fighters remain in the arena and will battle each other in outstanding fights!\n'
      + 'It was a pleasure to watch some bitter fights play out, but all good things must come to an end.\n'
      + 'If you were in the arena, good things might come your way soon. Don\'t fret, the final games will be coming up very soon!'
  });
}

async function postFightResult(embed) {
  console.log('[BOT] publish fight result')
  const channel = await getChannel(client, process.env.ARENA_CHANNEL_ID)
  return await channel.send({embeds: [embed]});
}

async function postResourceReveal(embed, file) {
  console.log('[BOT] publish resource reveal')
  const channel = await getChannel(client, process.env.REVEAL_CHANNEL_ID)
  return await channel.send({embeds: [embed], files: [file]});
}

async function postPotionReveal(embed, file) {
  console.log('[BOT] publish potion reveal')
  const channel = await getChannel(client, process.env.REVEAL_CHANNEL_ID)
  return await channel.send({embeds: [embed], files: [file]});
}

async function postNewTrade(embed) {
  console.log('[BOT] publish new trade')
  const channel = await getChannel(client, process.env.TRADE_CHANNEL_ID)
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

function mapClientIdToName(clientIds) {
  return Promise.all(clientIds.map(mapToName));
}

async function mapToName(clientId) {
  await client.guilds.fetch();
  const guild = client.guilds.cache.get(process.env.GUILD_ID);

  const guildMember = await guild.members.fetch(clientId)
  if (!guildMember) {
    console.warn('no user found for client id', clientId)
    return 'User not found'
  }
  return guildMember.user.globalName
}

async function getUserByClientId(clientId) {
  await client.guilds.fetch();
  const guild = client.guilds.cache.get(process.env.GUILD_ID);

  const guildMember = await guild.members.fetch(clientId)
  if (!guildMember) {
    console.warn('no user found for client id', clientId)
    return undefined
  }
  return guildMember.user
}