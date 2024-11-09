require('dotenv').config();
const {setupDiscordBot} = require("./setup-discord-bot.js");
const {MISSION_CONTRACT, MARKETPLACE_CONTRACT} = require("./abi-interaction.js")
const {fetchMissionReward} = require('./mission-interaction.js');
const cron = require('node-cron');
const {MongoClient} = require("mongodb");
const {publishSummary, sendVerificationDm, updateAllUsers, logMessageOrError} = require("./discord-client");
const {initStats, increaseExpeditionCounter, resetStats} = require("./summary/daily-stats");
const {handleNewTrade} = require("./trades/handle-new-trade");
const {EXPEDITION_CONTRACT} = require("./abi-interaction");
const {handleNewBid} = require("./trades/handle-new-bid");
const {handleBidAccepted} = require("./trades/handle-bid-accepted");

setupDiscordBot().then(() => {
  logMessageOrError('new start of discord bot')
  //handleNewTrade("0xd235b3b1ac41f7eaa72e7de14019fddce08d81e8b20f32843d3480e90c78c431") // soul
  setupMissionRewardListener()
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

function setupMissionRewardListener() {
  MISSION_CONTRACT.events.MissionReward({fromBlock: 'latest'})
    .on("connected", function (_subscriptionId) {
      console.log('connected to mission reward event')
    })
    .on('data', function (event) {
      fetchMissionReward(event)
    })
    .on('error', function (error, receipt) {
      logMessageOrError('Error in MISSION_CONTRACT MissionReward:', error, receipt);
    });

  MARKETPLACE_CONTRACT.events.BidCreated({fromBlock: 'latest'})
    .on("connected", function (_subscriptionId) {
      console.log('connected to bid created event')
    })
    .on('data', function (event) {
      handleNewBid(event.returnValues.bidId)
    })
    .on('error', function (error, receipt) {
      logMessageOrError('Error in MARKETPLACE_CONTRACT BidCreated:', error, receipt);
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
      logMessageOrError('Error in MARKETPLACE_CONTRACT TradeCreated:', error, receipt);
    });

  MARKETPLACE_CONTRACT.events.BidAccepted({fromBlock: 'latest'})
    .on("connected", function (_subscriptionId) {
      console.log('connected to bid accepted event')
    })
    .on('data', function (event) {
      handleBidAccepted(event.returnValues.tradeId)
    })
    .on('error', function (error, receipt) {
      logMessageOrError('Error in MARKETPLACE_CONTRACT BidAccepted:', error, receipt);
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
      logMessageOrError('Error in EXPEDITION_CONTRACT ExpeditionStart:', error, receipt);
    });
}