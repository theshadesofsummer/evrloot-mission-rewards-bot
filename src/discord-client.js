const { Client } = require("discord.js");
const generateSummary = require("./summary/generate-summary");
const {
  deleteWallet,
  getAllAccounts,
  updateDiscordInfo,
} = require("./evrloot-db");
const { verificationMessage } = require("./messaging/verification-message");

const client = new Client({ intents: 0 });

module.exports = {
  client,
  publishSummary,
  postEmbed,
  postFightResult,
  postTournamentStart,
  postTournamentStop,
  postNewTrade,
  postNewTradeWithImage,
  sendVerificationDm,
  mapClientIdToName,
  getUserByClientId,
  updateAllUsers,
  logMessageOrError,
};

async function publishSummary() {
  console.log("[BOT] publish summary");
  const channel = await getChannel(client, process.env.STATS_CHANNEL_ID);
  const summary = generateSummary();
  await channel.send(summary);
}

async function postEmbed(embed) {
  try {
    console.log(
      "[POST]",
      "attempting to post embed to channel:",
      process.env.PUBLISH_CHANNEL_ID
    );
    const channel = await getChannel(client, process.env.PUBLISH_CHANNEL_ID);
    if (!channel) {
      throw new Error(`Channel ${process.env.PUBLISH_CHANNEL_ID} not found`);
    }
    console.log("[POST]", "channel found:", channel.name, "sending embed...");
    const result = await channel.send({ embeds: [embed] });
    console.log("[POST]", "successfully sent embed, message ID:", result.id);
    return result;
  } catch (error) {
    console.error("[POST]", "ERROR posting embed:", error.message);
    console.error("[POST]", "stack:", error.stack);
    await logMessageOrError(
      "[POST] ERROR posting embed:",
      error.message,
      error.stack
    );
    throw error;
  }
}

async function postTournamentStart() {
  const channel = await getChannel(client, process.env.ARENA_CHANNEL_ID);
  return await channel.send({
    content:
      `# The tournament has been started!\n` +
      "Prove your worth among the ranks of your fellow souls, only the best ones may ascend into the finals.\n" +
      "Initiate the combat with the `/tournament` commands. Use `/tournament battle` to fight other players!\n " +
      "You can check the best souls with `/tournament leaderboard`\n\n" +
      "Good Luck out there, you will need it.",
  });
}

async function postTournamentStop() {
  const channel = await getChannel(client, process.env.ARENA_CHANNEL_ID);
  return await channel.send({
    content:
      `# The public phase of the tournament has ended!\n` +
      "From now on only the top 8 fighters remain in the arena and will battle each other in outstanding fights!\n" +
      "It was a pleasure to watch some bitter fights play out, but all good things must come to an end.\n" +
      "If you were in the arena, good things might come your way soon. Don't fret, the final games will be coming up very soon!",
  });
}

async function postFightResult(fight, embed) {
  console.log("[BOT] publish fight result");
  const channel = await getChannel(client, process.env.ARENA_CHANNEL_ID);
  return await channel.send({
    content: `<@${fight.teamA.discordId}> vs. <@${fight.teamB.discordId}>`,
    embeds: [embed],
  });
}

async function postNewTrade(embed) {
  console.log("[BOT] publish new trade");
  const channel = await getChannel(client, process.env.TRADE_CHANNEL_ID);
  return await channel.send({ embeds: [embed] });
}

async function postNewTradeWithImage(embed, file) {
  console.log("[BOT] publish new trade with image");
  const channel = await getChannel(client, process.env.TRADE_CHANNEL_ID);
  return await channel.send({ embeds: [embed], files: [file] });
}

async function sendVerificationDm(discordName, wallet) {
  try {
    await client.guilds.fetch();
    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    const memberMap = await guild.members.fetch({
      query: discordName,
      limit: 10,
    });

    let userWithMatchingUsername = undefined;
    memberMap.forEach((member) => {
      const username = member.user.username;
      if (username === discordName.toLowerCase()) {
        userWithMatchingUsername = member;
      }
    });

    if (!userWithMatchingUsername) {
      await logMessageOrError(
        "no user found in evrloot server for name",
        discordName,
        "therefore deleting entry"
      );
      await deleteWallet(wallet);
    } else {
      await logMessageOrError(
        "found user",
        discordName,
        " in evrloot server, trying to send dm"
      );
      await verificationMessage(client, userWithMatchingUsername, wallet);
    }
  } catch (e) {
    await logMessageOrError(
      "error while verification process for name",
      discordName,
      "wallet",
      wallet,
      "exception",
      e
    );
  }
}

async function getChannel(client, channelId) {
  if (!client.isReady()) {
    throw new Error("Discord client is not ready yet");
  }

  // Try to get guild from cache first
  let guild = client.guilds.cache.get(process.env.GUILD_ID);

  // If not in cache, fetch it directly
  if (!guild) {
    try {
      guild = await client.guilds.fetch(process.env.GUILD_ID);
    } catch (error) {
      throw new Error(
        `Guild with ID ${process.env.GUILD_ID} not found: ${error.message}`
      );
    }
  }

  if (!guild) {
    throw new Error(`Guild with ID ${process.env.GUILD_ID} not found`);
  }

  await guild.channels.fetch();
  return guild.channels.cache.get(channelId);
}

function mapClientIdToName(clientIds) {
  return Promise.all(clientIds.map(mapToName));
}

async function mapToName(clientId) {
  await client.guilds.fetch();
  const guild = client.guilds.cache.get(process.env.GUILD_ID);

  const guildMember = await guild.members.fetch(clientId);
  if (!guildMember) {
    console.warn("no user found for client id", clientId);
    await logMessageOrError(
      "mapToName: could not find user in server with client id",
      clientId
    );
    return "User not found";
  }
  return guildMember.user.globalName;
}

async function getUserByClientId(clientId) {
  await client.guilds.fetch();
  const guild = client.guilds.cache.get(process.env.GUILD_ID);

  try {
    const guildMember = await guild.members.fetch(clientId);

    if (!guildMember) {
      await logMessageOrError(
        "getUserByClientId: could not find user in server with client id",
        clientId
      );
      console.warn("no user found for client id", clientId);
      return undefined;
    }
    return guildMember.user;
  } catch (err) {
    return undefined;
  }
}

async function updateAllUsers() {
  const accounts = await getAllAccounts();
  const discordIds = accounts.map((account) => account.discordId);
  const filteredDiscordIds = [...new Set(discordIds)];

  for (const discordId of filteredDiscordIds) {
    try {
      const user = await getUserByClientId(discordId);
      if (user) {
        await updateDiscordInfo(user.id, user.username, user.avatarURL());

        // possible result if nothing changed:
        // {
        //   acknowledged: true,
        //   modifiedCount: 0,
        //   upsertedId: null,
        //   upsertedCount: 0,
        //   matchedCount: 13
        // }
      }
    } catch (e) {
      console.error("error while updating users", discordId, e);
      await logMessageOrError("error while updating users", discordId, e);
    }
  }
  console.log("finished update of all users");
  // await client.guilds.fetch();
  // const guild = client.guilds.cache.get(process.env.GUILD_ID);
  //
  // const guildMember = await guild.members.fetch(clientId)
  // if (!guildMember) {
  //   console.warn('no user found for client id', clientId)
  //   return undefined
  // }
  // return guildMember.user
}

async function logMessageOrError(...messages) {
  const message = messages.join(" ");
  try {
    const channel = await getChannel(client, process.env.ERROR_CHANNEL_ID);
    if (!channel) {
      console.error("[LOG] Channel not found, logging to console:", message);
      return;
    }
    return await channel.send(message);
  } catch (e) {
    console.error(
      "[LOG] Could not log to Discord channel, logging to console:",
      message
    );
    console.error("[LOG] Error details:", e.message);
  }
}
