require('dotenv').config();
const {setupDiscordBot} = require("./setup-discord-bot.js");
const {MISSION_CONTRACT, MARKETPLACE_CONTRACT, EXPEDITION_CONTRACT} = require("./abi-interaction.js")
const {fetchMissionReward} = require('./mission-interaction.js');
const cron = require('node-cron');
const {MongoClient} = require("mongodb");
const {publishSummary, sendVerificationDm, updateAllUsers, logMessageOrError} = require("./discord-client");
const {initStats, increaseExpeditionCounter} = require("./summary/daily-stats");
const {handleNewTrade} = require("./trades/handle-new-trade");
const {handleNewBid} = require("./trades/handle-new-bid");
const {handleBidAccepted} = require("./trades/handle-bid-accepted");

setupDiscordBot().then(() => {
  logMessageOrError('new start of discord bot')
  //handleNewTrade("0xd235b3b1ac41f7eaa72e7de14019fddce08d81e8b20f32843d3480e90c78c431") // soul
  setupContractEvents()

  setupMongoDbConnection()
  initStats()

  cron.schedule('0 0 * * *', () => {
    publishSummary();
    updateAllUsers()
  });
});

function setupMongoDbConnection() {
  const uri = `mongodb+srv://${process.env.MONGODB_ACCESS}@cluster0.cbrbn.mongodb.net/evrloot?retryWrites=true&w=majority`;

  MongoClient.connect(uri).then((client, err) => {
    if (err) {
      logMessageOrError('Failed to connect to MongoDB:', err);
      return;
    } else {
      console.log('connected to mongodb client')
    }

    const collection = client.db("evrloot").collection("discordverifications");

    // Initialize change stream
    if (process.env.DISCORDJS_CLIENTID !== "1121489061115338773") {
      const changeStream = collection.watch([{$match: {operationType: "insert"}}]);

      // Start listening to changes
      changeStream.on('change', (next) => {
        console.log('sending discord dm to', next.fullDocument.discordId, 'with', next.fullDocument.wallet)
        sendVerificationDm(next.fullDocument.discordName, next.fullDocument.wallet)
      });

      // Handle errors (optional but recommended)
      changeStream.on('error', (error) => {
        logMessageOrError('Error in dbconnection to discordverifications:', error);
      });

      // Close change stream after some time or based on some condition (optional)
      // setTimeout(() => {
      //     changeStream.close();
      //     client.close();
      // }, 60000); // Close after 1 minute
    }
  });
}

function setupContractEvents() {
  MISSION_CONTRACT.on('MissionReward', async (
    tokenId,             // uint256
    missionId,           // uint16
    activityId,          // uint16
    experienceGained,    // uint256
    nftRewards,          // Array of { contractAddress: string, itemId: number, amount: number }
    resourceRewards,     // Array of { resourceId: number, amount: number }
    event                // Full event log object
  ) => {
    console.log('MissionReward Event Details:');
    console.log('tokenId:', tokenId);
    console.log('missionId:', missionId);
    console.log('activityId:', activityId);
    console.log('experienceGained:', experienceGained);
    console.log('nftRewards:', nftRewards);
    console.log('resourceRewards:', resourceRewards);
    await fetchMissionReward(tokenId, nftRewards, resourceRewards);
  });

  MARKETPLACE_CONTRACT.on('BidCreated', async (bidId) => {
    console.log('BidCreated event received:', bidId);
    await handleNewBid(bidId);
  });

  MARKETPLACE_CONTRACT.on('TradeCreated', async (tradeId) => {
    console.log('TradeCreated event received:', tradeId);
    await handleNewTrade(tradeId);
  });

  MARKETPLACE_CONTRACT.on('BidAccepted', async (tradeId) => {
    console.log('BidAccepted event received:', tradeId);
    await handleBidAccepted(tradeId);
  });

  EXPEDITION_CONTRACT.on('ExpeditionStart', async (_event) => {
    console.log('ExpeditionStart event received');
    increaseExpeditionCounter()
  });
}