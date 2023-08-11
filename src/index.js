require('dotenv').config();
const { setupDiscordBot, publishSummary } = require("./discord-bot.js");
const { MISSION_CONTRACT } = require("./abi-interaction.js")
const { fetchMissionReward } = require('./mission-interaction.js');
const cron = require('node-cron');

setupDiscordBot().then(() => {
    setupAuctionListener()
    cron.schedule('0 * * * *', () => {
        publishSummary();
    });

});

function setupAuctionListener() {
    MISSION_CONTRACT.events.MissionReward({fromBlock: 'latest'})
      .on("connected", function (_subscriptionId) {
        console.log('connected to mission reward event')
      })
      .on('data', function (event) {
        fetchMissionReward(event)
      })
      .on('error', function (error, receipt) {
        console.log('Error:', error, receipt);
      });
}