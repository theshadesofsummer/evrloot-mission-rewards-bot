require("dotenv").config();

const OPTIONS = {
  LOG_GUILD_DATA: false,
  LOG_SELF_DATA: false,
  TEST_DISCORD_USER_MENTION: false,
};

const EVRLOOT_DISCORD_SERVER_ID = process.env.EVRLOOT_DISCORD_SERVER_ID;
const VALID_EMOJI = process.env.VALID_EMOJI;
const DISCORD_BOT_PROD_CHANNEL = process.env.DISCORD_BOT_PROD_CHANNEL;
const DISCORD_BOT_DEBUG_CHANNEL = process.env.DISCORD_BOT_DEBUG_CHANNEL;

const DEBUG = DISCORD_BOT_DEBUG_CHANNEL;
const PROD = DISCORD_BOT_PROD_CHANNEL;
const { Client, GatewayIntentBits } = require("discord.js");

const { setupDiscordBot } = require("./setup-discord-bot.js");
const { updateDocument } = require("./evrloot-db");

const { MongoClient } = require("mongodb");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

if (OPTIONS.LOG_SELF_DATA) {
  client.once("ready", async () => {
    console.log(`Logged in as ${client.user.tag}!`);
  });
}

if (OPTIONS.TEST_DISCORD_USER_MENTION) {
  client.once("ready", async () => {
    const testUser = await lookupDiscordUser("blocksbrandon");
    if (testUser) {
      sendDiscordMessage(
        DEBUG,
        `Found test user: ${testUser.user.tag} (ID: ${testUser.user.id})`
      );
      sendDiscordMessage(DEBUG, `Hello <@${testUser.user.id}>`);
    }
  });
}

if (OPTIONS.LOG_GUILD_DATA) {
  client.once("ready", async () => {
    const guilds = await client.guilds.fetch();
    console.log("\n=== GUILDS ===");
    guilds.forEach((guild) => {
      console.log(`Guild: ${guild.name} (ID: ${guild.id})`);
    });

    // Fetch and log channels for each guild
    for (const [, guild] of guilds) {
      const fullGuild = await guild.fetch();
      const channels = await fullGuild.channels.fetch();

      console.log(`\n=== CHANNELS for ${fullGuild.name} ===`);
      channels.forEach((channel) => {
        console.log(
          `Channel: ${channel.name} (ID: ${channel.id}) - Type: ${channel.type}`
        );
      });
    }
  });
}

client.login(process.env.PROD_DISCORDJS_TOKEN).catch((err) => {
  console.error("Failed to login to Discord:", err);
  process.exit(1);
});

client.on("messageReactionAdd", async (reaction, user) => {
  // Skip if not in the target channel
  if (reaction.message.channel.id !== DISCORD_BOT_PROD_CHANNEL) {
    return;
  }

  // When a reaction is received, check if we need to fetch it
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      sendDiscordMessage(DEBUG, "Error fetching reaction:", error);
      return;
    }
  }

  // Fetch the full message if needed
  if (reaction.message.partial) {
    try {
      await reaction.message.fetch();
    } catch (error) {
      sendDiscordMessage(DEBUG, "Error fetching message:", error);
      return;
    }
  }

  // Check if this is a verification message (contains the verification prompt)
  if (reaction.message.content.includes("react with 👍 if this is you")) {
    // Extract wallet from message
    const walletMatch = reaction.message.content.match(
      /Wallet: (0x[a-fA-F0-9]+)/
    );
    if (!walletMatch) {
      sendDiscordMessage(
        DEBUG,
        `❌ Failed to extract wallet from message\n` +
          `• 📝 Message ID: ${reaction.message.id}\n` +
          `• 💬 Message Content: "${reaction.message.content}"`
      );
      return;
    }
    const partialWallet = walletMatch[1];

    // Check if the emoji is correct
    if (reaction.emoji.name === VALID_EMOJI) {
      // Check if the user reacting is the mentioned user in the message
      const userMentionInMessage = reaction.message.content.match(/<@(\d+)>/);
      if (userMentionInMessage && userMentionInMessage[1] === user.id) {
        // Both emoji and user match! Update document and send approval message
        try {
          await updateDocument(
            { wallet: { $regex: `^${partialWallet}` } },
            { verified: true, discordId: user.id }
          );

          sendDiscordMessage(
            PROD,
            `✅ Verification successful!  Send me a Direct message with \`/connected-wallets\` to manage your Discord connection(s).\n` +
              `• 👤 User: <@${user.id}>\n` +
              `• 💳 Wallet: ${partialWallet}...\n` +
              `• ✨ Status: Verified\n` +
              `• 🕒 Time: ${new Date().toISOString()}`
          );
        } catch (error) {
          sendDiscordMessage(
            DEBUG,
            `❌ Failed to update verification status\n` +
              `• 👤 User: ${user.tag} (${user.id})\n` +
              `• 💳 Partial Wallet: ${partialWallet}\n` +
              `• ❌ Error: ${error.message}\n` +
              `• 📝 Message ID: ${reaction.message.id}\n` +
              `• 💬 Message Content: "${reaction.message.content}"`
          );
        }
      } else {
        // Wrong user reacting
        sendDiscordMessage(
          DEBUG,
          `❌ Wrong user reacting to verification message\n` +
            `• 🎯 Expected user: ${
              userMentionInMessage ? userMentionInMessage[1] : "Unknown"
            }\n` +
            `• 👤 Actual user: ${user.id}\n` +
            `• 💳 Wallet: ${partialWallet}...\n` +
            `• 📝 Message ID: ${reaction.message.id}\n` +
            `• 💬 Message Content: "${reaction.message.content}"`
        );
      }
    } else {
      // Wrong emoji
      sendDiscordMessage(
        DEBUG,
        `❌ Wrong emoji used for verification\n` +
          `• 🎯 Expected: ${VALID_EMOJI}\n` +
          `• 👤 Received: ${reaction.emoji.name}\n` +
          `• 🧑 User: ${user.tag} (${user.id})\n` +
          `• 💳 Wallet: ${partialWallet}...\n` +
          `• 📝 Message ID: ${reaction.message.id}\n` +
          `• 💬 Message Content: "${reaction.message.content}"`
      );
    }
  }
});

client.on("messageReactionRemove", async (reaction, user) => {
  // Skip if not in the target channel
  if (reaction.message.channel.id !== DISCORD_BOT_PROD_CHANNEL) {
    return;
  }

  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      sendDiscordMessage(DEBUG, "Error fetching reaction:", error);
      return;
    }
  }

  // Fetch the full message if needed
  if (reaction.message.partial) {
    try {
      await reaction.message.fetch();
    } catch (error) {
      sendDiscordMessage(DEBUG, "Error fetching message:", error);
      return;
    }
  }

  sendDiscordMessage(
    DEBUG,
    `Reaction ${reaction.emoji.name} removed by ${user.tag}\n` +
      `Message ID: ${reaction.message.id}\n` +
      `Message Content: "${reaction.message.content}"\n` +
      `Channel: ${reaction.message.channel.name}`
  );
});

async function getChannel(client, channelId) {
  // Ensure client is ready before proceeding
  if (!client.isReady()) {
    throw new Error("Discord client is not ready");
  }

  // Fetch all guilds
  const guilds = await client.guilds.fetch();

  // Search through all guilds for the channel
  for (const [, guild] of guilds) {
    const fullGuild = await guild.fetch();
    const channels = await fullGuild.channels.fetch();
    const channel = channels.get(channelId);
    if (channel) {
      return channel;
    }
  }

  throw new Error(`Could not find channel with ID ${channelId} in any guild`);
}

async function sendDiscordMessage(channelId, ...messages) {
  try {
    console.log("sending message to public channel");
    const channel = await getChannel(client, channelId);
    if (!channel) {
      throw new Error("Could not find public channel");
    }
    const messageContent = messages.join(" ");
    console.log("[Discord Message]:", messageContent);

    const sentMessage = await channel.send({
      content: messageContent,
    });

    console.log(`Message sent with ID: ${sentMessage.id}`);
    return sentMessage;
  } catch (e) {
    console.error("Error in sendDiscordMessage:", e);
    console.error("Original message:", messages.join(" "));
  }
}

setupDiscordBot({ environment: "DEV" }).then(async () => {
  console.log("Setting up Discord bot");
  await sendDiscordMessage(
    DEBUG,
    `🤖🤖🤖 Trader Khalil bot is starting 🤖🤖🤖`
  );

  await setupMongoDbConnection();
});

async function setupMongoDbConnection() {
  const uri = `mongodb+srv://${process.env.MONGODB_ACCESS}@cluster0.cbrbn.mongodb.net/evrloot?retryWrites=true&w=majority`;

  MongoClient.connect(uri).then((client, err) => {
    if (err) {
      sendDiscordMessage(DEBUG, "Failed to connect to MongoDB:", err);
      return;
    } else {
      sendDiscordMessage(DEBUG, "✅ Successful connection to MongoDB");
    }

    const collection = client.db("evrloot").collection("discordverifications");

    console.log(
      `process.env.DISCORDJS_CLIENTID: ${process.env.DISCORDJS_CLIENTID}`
    );

    const changeStream = collection.watch([
      {
        $match: {
          operationType: { $in: ["insert", "update", "delete"] },
        },
      },
    ]);

    // Start listening to changes
    changeStream.on("change", async (next) => {
      const dbObjectId = next.documentKey._id?.toString();

      if (next.operationType === "insert") {
        console.log("🆕 Processing DB Insert:", dbObjectId);
        const wallet = next.fullDocument?.wallet || "N/A";
        const discordName = next.fullDocument?.discordName || "N/A";

        // Try to lookup Discord user
        const discordUser = await lookupDiscordUser(discordName);
        const lookupStatus = discordUser
          ? `✅ Success - Found ID: ${discordUser.user.id}`
          : "❌ Failed - User not found";

        sendDiscordMessage(
          DEBUG,
          `[Verification Request - DB **INSERT**] 🆕
• 🆔 DB Object ID: ${dbObjectId}
• 👤 Discord Name: ${discordName}
• 🔍 Discord Lookup: ${lookupStatus}
• 💳 Wallet: ${wallet}
• ⏳ Status: Pending verification`
        );

        // If we found the user, proceed with verification message
        if (discordUser) {
          const message = await sendDiscordMessage(
            PROD,
            `Hey <@${
              discordUser.user.id
            }>, react with 👍 if this is you and you'll be verified! (Wallet: ${wallet.slice(
              0,
              6
            )}...${wallet.slice(-4)})`
          );
        } else {
          sendDiscordMessage(
            DEBUG,
            `⚠️ Could not send verification message - Discord user "${discordName}" not found`
          );
        }
      }

      if (next.operationType === "update") {
        console.log("📝 Processing DB Update:", dbObjectId);
        // For updates, the changes are in updateDescription.updatedFields
        const updatedFields = next.updateDescription?.updatedFields || {};
        const updatedFieldNames = Object.keys(updatedFields);

        sendDiscordMessage(
          DEBUG,
          `[Verification Request - DB **UPDATE**] 📝
• 🆔 DB Object ID: ${dbObjectId}
• 🔄 Updated Fields: ${updatedFieldNames.join(", ")}
• ✨ New Values: ${updatedFieldNames
            .map((field) => `${field}: ${updatedFields[field]}`)
            .join(", ")}
• ℹ️ Status: Modified`
        );
      }

      if (next.operationType === "delete") {
        console.log("🗑️ Processing DB Delete:", dbObjectId);
        sendDiscordMessage(
          DEBUG,
          `[Verification Request - DB **DELETE**] 🗑️
• 🆔 DB Object ID: ${dbObjectId}
• ❌ Status: Removed from database`
        );
      }
    });

    // Handle errors (optional but recommended)
    changeStream.on("error", (error) => {
      sendDiscordMessage(
        DEBUG,
        "Oh no!  Error in dbconnection to discordverifications:",
        error
      );
    });
  });
}

async function lookupDiscordUser(username) {
  try {
    const guild = client.guilds.cache.get(EVRLOOT_DISCORD_SERVER_ID);
    if (!guild) {
      throw new Error("Could not find Evrloot Discord server");
    }

    const memberMap = await guild.members.fetch({
      query: username,
      limit: 10,
    });

    const members = Array.from(memberMap.values());

    if (members.length === 0) {
      sendDiscordMessage(
        DEBUG,
        `Error: No users found matching username "${username}"`
      );
      return null;
    }

    if (members.length > 1) {
      sendDiscordMessage(
        DEBUG,
        `Warning: Multiple users (${members.length}) found matching "${username}". Using first match: ${members[0].user.tag}`
      );
    }

    return members[0];
  } catch (error) {
    sendDiscordMessage(
      DEBUG,
      `Error looking up Discord user: ${error.message}`
    );
    return null;
  }
}
