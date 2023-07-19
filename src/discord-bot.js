const { Client } = require('discord.js');

module.exports = {
  setupDiscordBot,
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

async function postEmbed(embed) {
  await client.guilds.fetch();
  const guild = client.guilds.cache.get("1039143267285073990");

  await guild.channels.fetch();
  const channel = guild.channels.cache.get("1121489416209322075");

  await channel.send({embeds: [embed]});
}
