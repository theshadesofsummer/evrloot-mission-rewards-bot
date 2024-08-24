require('dotenv').config();
const {setupDiscordBot} = require("./setup-discord-bot.js");
const {MISSION_CONTRACT, MARKETPLACE_CONTRACT} = require("./abi-interaction.js")
const {fetchMissionReward} = require('./mission-interaction.js');
const cron = require('node-cron');
const {MongoClient} = require("mongodb");
const {publishSummary, sendVerificationDm} = require("./discord-client");
const {initStats, increaseExpeditionCounter, resetStats} = require("./summary/daily-stats");
const {loadRevealStatus} = require("./reveal-status");
const {handleNewTrade} = require("./trades/handle-new-trade");
const {EXPEDITION_CONTRACT} = require("./abi-interaction");
const {handleNewBid} = require("./trades/handle-new-bid");
const {handleBidAccepted} = require("./trades/handle-bid-accepted");

setupDiscordBot().then(() => {
  //handleNewTrade("0xd235b3b1ac41f7eaa72e7de14019fddce08d81e8b20f32843d3480e90c78c431") // soul
  setupMissionRewardListener()
  setupMongoDbConnection()
  initStats()
  loadRevealStatus()

  cron.schedule('0 0 * * *', () => {
    publishSummary();
  });


});

function setupMongoDbConnection() {
  const uri = `mongodb+srv://${process.env.MONGODB_ACCESS}@cluster0.cbrbn.mongodb.net/evrloot?retryWrites=true&w=majority`;

  MongoClient.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true}).then((client, err) => {
    if (err) {
      console.error('Failed to connect', err);
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
        console.error('Error in change stream', error);
      });

      // Close change stream after some time or based on some condition (optional)
      // setTimeout(() => {
      //     changeStream.close();
      //     client.close();
      // }, 60000); // Close after 1 minute
    }
  });
}

function setupMissionRewardListener() {
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

  MARKETPLACE_CONTRACT.events.BidCreated({fromBlock: 'latest'})
    .on("connected", function (_subscriptionId) {
      console.log('connected to bid created event')
    })
    .on('data', function (event) {
      handleNewBid(event.returnValues.bidId)
    })
    .on('error', function (error, receipt) {
      console.log('Error:', error, receipt);
    });

  MARKETPLACE_CONTRACT.events.TradeCreated({fromBlock: 'latest'})
    .on("connected", function (_subscriptionId) {
      console.log('connected to trade created event')
    })
    .on('data', function (event) {
      console.log('trade created event')

      handleNewTrade(event.returnValues.tradeId)
    })
    .on('error', function (error, receipt) {
      console.log('Error:', error, receipt);
    });

  MARKETPLACE_CONTRACT.events.BidAccepted({fromBlock: 'latest'})
    .on("connected", function (_subscriptionId) {
      console.log('connected to bid accepted event')
    })
    .on('data', function (event) {
      console.log('bid accepted event')
      console.log('>>> event', event)

      handleBidAccepted(event.returnValues.tradeId)
    })
    .on('error', function (error, receipt) {
      console.log('Error:', error, receipt);
    });


  EXPEDITION_CONTRACT.events.ExpeditionStart({fromBlock: 'latest'})
    .on("connected", function (_subscriptionId) {
      console.log('connected to expedition start event')
    })
    .on('data', function (_event) {
      console.log('increaseExpeditionCounter')
      increaseExpeditionCounter()
    })
    .on('error', function (error, receipt) {
      console.log('Error:', error, receipt);
    });
}