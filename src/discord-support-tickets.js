require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");

const DISCORD_BOT_SUPPORT_TICKET_LOG_CHANNEL_ID = "1372938180701065256";

const producerClient = new Client({
  intents: [],
});

const consumerClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

producerClient.login(process.env.PRODUCER_DISCORD_TOKEN).catch((err) => {
  console.error("Failed to login to Discord:", err);
  process.exit(1);
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

consumerClient.on("messageCreate", async (message) => {
  let debugMsg = `<#${message.channelId}> | <@${message.author.id}> | ${message.content}`;
  console.log(debugMsg);
  if (!message.channel.name.startsWith("ticket-")) return;
  if (message.author.bot) return;
  if (message.attachments && message.attachments.size > 0) {
    const imageUrls = Array.from(message.attachments.values())
      .filter((att) => att.contentType && att.contentType.startsWith("image/"))
      .map((att) => att.url);
    if (imageUrls.length > 0) {
      debugMsg += "\nImages: " + imageUrls.join(" ");
    }
  }
  sendDiscordMessage(DISCORD_BOT_SUPPORT_TICKET_LOG_CHANNEL_ID, debugMsg);
  console.log("Message sent to Discord");
});

consumerClient.on("channelCreate", async (channel) => {
  try {
    const msg = `New ticket created: <#${channel.id}> (ID: ${channel.id})`;
    await sendDiscordMessage(DISCORD_BOT_SUPPORT_TICKET_LOG_CHANNEL_ID, msg);
    console.log(msg);
  } catch (e) {
    console.error("Error sending new channel creation message:", e);
  }
});

consumerClient.on("channelUpdate", async (oldChannel, newChannel) => {
  try {
    if (oldChannel.name !== newChannel.name) {
      let msg;
      if (newChannel.name.startsWith("closed-")) {
        msg = `Case Closed: <#${newChannel.id}> (${oldChannel.name} -> ${newChannel.name})`;
      } else {
        msg = `Channel Renamed: <#${newChannel.id}> (${oldChannel.name} -> ${newChannel.name})`;
      }
      await sendDiscordMessage(DISCORD_BOT_SUPPORT_TICKET_LOG_CHANNEL_ID, msg);
      console.log(msg);
    }
  } catch (e) {
    console.error("Error sending channel rename message:", e);
  }
});
