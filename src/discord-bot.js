const { Client, ButtonStyle, ActionRowBuilder, ButtonBuilder} = require('discord.js');
const generateSummary = require('./summary/generate-summary.js')
const {updateDocument, deleteDocument} = require("./evrloot-db");

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

  const dmMessage = `Welcome Traveller, i found a ripped piece of paper in the palace, it recited your name and the following combination i can't seem to make sense of...\n` +
    `It stated: \`${wallet}\`\n` +
    `Can you make sense of this?`;

  const confirm = new ButtonBuilder()
    .setCustomId('confirm')
    .setLabel('Yes, i recall this combination!')
    .setStyle(ButtonStyle.Success);

  const deny = new ButtonBuilder()
    .setCustomId('deny')
    .setLabel('No, i have never that!')
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder()
    .addComponents(deny, confirm);

  for (let member of memberMap.values()){
    await member.createDM()
    const confirmationDm = await member.send({
      content: dmMessage,
      components: [row],
    })

    try {
      const confirmation = await confirmationDm.awaitMessageComponent({ time: 60_000 });

      if (confirmation.customId === 'confirm') {
        await updateDocument({wallet}, {verified: true})

        await confirmation.update({ components: [] });
        await member.send(`Thanks, i knew you i could count on you!\nI will keep this note stored safe!`)
      } else if (confirmation.customId === 'deny') {
        await deleteDocument({wallet})
        await confirmation.update({ components: [] });
        await member.send(`Of course, this looked like total gibberish. I'm sorry for wasting your time, traveller!`)
      }
    } catch (e) {
      console.log('user did not react or some error happened:', e)
      await deleteDocument({wallet})
      await member.send({ content: `Not the most talkative, are you traveller? Do not worry, i'll just throw the paper into the well.`, components: [] });
    }
  }
}

async function getChannel(client, channelId) {
  await client.guilds.fetch();
  const guild = client.guilds.cache.get(process.env.GUILD_ID);

  await guild.channels.fetch();
  return guild.channels.cache.get(channelId);
}