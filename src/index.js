require('dotenv').config();
const { setupDiscordBot } = require("./discord-bot.js");
const { MISSION_CONTRACT } = require("./abi-interaction.js")
const { fetchMissionReward } = require('./mission-interaction.js');

setupDiscordBot().then(() => setupAuctionListener());

function setupAuctionListener() {
    MISSION_CONTRACT.events.MissionReward(() => {
    }).on("connected", function (_subscriptionId) {
        console.log('connected to mission reward event')
    }).on('data', function (event) {
        fetchMissionReward(event)
    }).on('error', function (error, receipt) {
        console.log('Error:', error, receipt);
    });
}