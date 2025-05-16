require("dotenv").config();
const { MongoClient } = require("mongodb");

const { Client, GatewayIntentBits } = require("discord.js");

const DISCORD_BOT_SUPPORT_TICKET_LOG_CHANNEL_ID = "1372938180701065256";

const DISCORD_BOT_DEBUG_CHANNEL = "1366445820114899067";
const PROD_IN_GAME_SUPPORT_TICKET_LOG_CHANNEL_ID = "1372994212286431464";

const LOG_CHANNEL = PROD_IN_GAME_SUPPORT_TICKET_LOG_CHANNEL_ID;

const consumerClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

consumerClient.login(process.env.CONSUMER_DISCORD_TOKEN).catch((err) => {
  console.error("Failed to login to Discord:", err);
  process.exit(1);
});

async function getChannel(client, channelId) {
  if (!client.isReady()) {
    throw new Error("Discord client is not ready");
  }
  const guilds = await client.guilds.fetch();
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
    const channel = await getChannel(consumerClient, channelId);
    if (!channel) {
      throw new Error("Could not find public channel");
    }
    const messageContent = messages.join(" ");
    console.log("[Discord Message]:", messageContent);
    await channel.send({
      content: messageContent,
    });
  } catch (e) {
    console.error("Error in sendDiscordMessage:", e);
    console.error("Original message:", messages.join(" "));
  }
}

async function setupMongoDbConnection() {
  const uri = `mongodb+srv://${process.env.MONGODB_ACCESS}@cluster0.cbrbn.mongodb.net/evrloot?retryWrites=true&w=majority`;
  try {
    const client = await MongoClient.connect(uri);
    const msg = `✅ Successful connection to MongoDB for ingame support ticket bot`;
    console.log(msg);
    sendDiscordMessage(LOG_CHANNEL, msg);

    const collection = client.db("evrloot").collection("supportissues");

    const changeStream = collection.watch([
      {
        $match: {
          operationType: { $in: ["insert", "update"] },
        },
      },
    ]);

    // Start listening to changes
    changeStream.on("change", async (next) => {
      const dbObjectId = next.documentKey._id?.toString();

      if (next.operationType === "insert") {
        const discord = next.fullDocument?.discord || "N/A";
        const issue = next.fullDocument?.issue || "N/A";
        const account = next.fullDocument?.account || "N/A";
        const id = next.fullDocument?._id?.toString() || "N/A";
        const supportLink =
          id !== "N/A" ? `https://evrloot.com/admin/support/${id}` : "N/A";
        const screenshots = Array.isArray(next.fullDocument?.screenshots)
          ? next.fullDocument.screenshots
          : [];
        const includesScreenshots =
          screenshots.length > 0 ? "Includes screenshots" : "";
        const message = `✅ In-Game Support Ticket Created\nDiscord: ${discord}\nIssue: ${issue}\nAccount: ${account}\nSupport Link: ${supportLink}${
          includesScreenshots ? `\n${includesScreenshots}` : ""
        }`;
        console.log("Prepared message:\n" + message);
        sendDiscordMessage(LOG_CHANNEL, message);
      }

      if (next.operationType === "update") {
        // TODO once updating is fixed
        console.log("📝 Processing DB Update:", dbObjectId);
        // For updates, the changes are in updateDescription.updatedFields
        const updatedFields = next.updateDescription?.updatedFields || {};
        const updatedFieldNames = Object.keys(updatedFields);

        // sendDiscordMessage(
        //   DEBUG,
        //   `[Verification Request - DB **UPDATE**] 📝\n  • 🆔 DB Object ID: ${dbObjectId}\n  • 🔄 Updated Fields: ${updatedFieldNames.join(
        //     ", "
        //   )}\n  • ✨ New Values: ${updatedFieldNames
        //     .map((field) => `${field}: ${updatedFields[field]}`)
        //     .join(", ")}\n  • ℹ️ Status: Modified`
        // );
      }
    });

    // Handle errors (optional but recommended)
    changeStream.on("error", (error) => {
      sendDiscordMessage(
        LOG_CHANNEL,
        "Oh no!  Error in dbconnection to discordverifications:",
        error
      );
    });
  } catch (err) {
    sendDiscordMessage(LOG_CHANNEL, "Failed to connect to MongoDB:", err);
  }
}

if (require.main === module) {
  console.log("Starting ingame support tickets");
  setupMongoDbConnection();
}
