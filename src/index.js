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
let provider = require("./provider")
const {ethers} = require("ethers");

setupDiscordBot().then(async () => {
  await logMessageOrError('new start of discord bot')

  //handleNewTrade("0xd235b3b1ac41f7eaa72e7de14019fddce08d81e8b20f32843d3480e90c78c431") // soul
  await setupContractEvents()
  await setupMongoDbConnection()

  // await handleBidAccepted("0xee3256046d663f68f62db61e1debf5fbb046949285491f7e2a27524b6e567075") // soul
  // await handleNewTrade("0xee3256046d663f68f62db61e1debf5fbb046949285491f7e2a27524b6e567075") // soul
  // await handleNewBid("0xee3256046d663f68f62db61e1debf5fbb046949285491f7e2a27524b6e567075") // soul
  initStats()

  cron.schedule('0 0 * * *', async () => {
    await publishSummary();
    try {
      await updateAllUsers()
    } catch (error) {
      await logMessageOrError('there was in issue in the daily fetching of the users info (pb etc.)', error)
    }
    await handleReconnection();
  });
});

async function setupMongoDbConnection() {
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
        console.log('new discord verification for id', next.fullDocument.discordName, 'with', next.fullDocument.wallet)
        logMessageOrError(`new discord verification for discord name ${next.fullDocument.discordName} with wallet ${next.fullDocument.wallet}`)
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

async function setupContractEvents() {
  await MISSION_CONTRACT.on('MissionReward', async (
    tokenId,             // uint256
    missionId,           // uint16
    activityId,          // uint16
    experienceGained,    // uint256
    nftRewards,          // Array of { contractAddress: string, itemId: number, amount: number }
    resourceRewards,     // Array of { resourceId: number, amount: number }
    event                // Full event log object
  ) => {
    await fetchMissionReward(tokenId, nftRewards, resourceRewards);
  });

  await MARKETPLACE_CONTRACT.on('BidCreated', async (bidId) => {
    console.log('BidCreated event received:', bidId);
    try {
      await handleNewBid(bidId);
    } catch (e) {
      await logMessageOrError('Failed to handle new bid', bidId);
    }
  });

  await MARKETPLACE_CONTRACT.on('TradeCreated', async (tradeId) => {
    console.log('TradeCreated event received:', tradeId);
    try {
      await handleNewTrade(tradeId);
    } catch (e) {
      await logMessageOrError('Failed to handle new trade', tradeId);
    }
  });

  await MARKETPLACE_CONTRACT.on('BidAccepted', async (tradeId) => {
    console.log('BidAccepted event received:', tradeId);
    try {
      await handleBidAccepted(tradeId);
    } catch (e) {
      await logMessageOrError('Failed to handle new bid accepted', tradeId);
    }
  });

  await EXPEDITION_CONTRACT.on('ExpeditionStart', async (_event) => {
    console.log('ExpeditionStart event received');
    increaseExpeditionCounter()
  });

  monitorConnection();
}

const HEARTBEAT_INTERVAL = 60_000;
function monitorConnection() {
  let counter = 0;
  setInterval(async () => {
    try {
      await provider.getBlockNumber();
      counter++;
      if (counter > 60) {
        console.log('hourly info, WebSocket connection is active.');
        counter = 0;
      }
    } catch (error) {
      console.warn('WebSocket connection lost. Attempting to reconnect...', error);
      await handleReconnection();
    }
  }, HEARTBEAT_INTERVAL);
}

let isReconnecting = false;
async function handleReconnection() {
  if (isReconnecting) return;
  isReconnecting = true;

  console.log('Reconnecting to WebSocket provider...');
  while (true) {
    try {
      // Recreate the provider
      provider = new ethers.WebSocketProvider('wss://moonbeam.blastapi.io/3f7856cf-73cf-489e-9973-0daafbd333a6');
      await provider.getBlockNumber();
      console.log('Reconnected to WebSocket provider.');

      await setupContractEvents();
      isReconnecting = false;
      break;
    } catch (error) {
      console.error('Reconnection failed. Retrying in 10 seconds...', error);
      await new Promise((resolve) => setTimeout(resolve, 10_000));
    }
  }
}