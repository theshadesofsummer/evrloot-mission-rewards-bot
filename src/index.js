require("dotenv").config();
const { setupDiscordBot } = require("./setup-discord-bot.js");
const {
  MISSION_CONTRACT,
  MARKETPLACE_CONTRACT,
  EXPEDITION_CONTRACT,
} = require("./abi-interaction.js");
const { fetchMissionReward } = require("./mission-interaction.js");
const cron = require("node-cron");
const { MongoClient } = require("mongodb");
const {
  client,
  publishSummary,
  sendVerificationDm,
  updateAllUsers,
  logMessageOrError,
} = require("./discord-client");
const {
  initStats,
  increaseExpeditionCounter,
} = require("./summary/daily-stats");
const { handleNewTrade } = require("./trades/handle-new-trade");
const { handleNewBid } = require("./trades/handle-new-bid");
const { handleBidAccepted } = require("./trades/handle-bid-accepted");

setupDiscordBot().then(async () => {
  // Wait for client to be ready before logging
  if (!client.isReady()) {
    await new Promise((resolve) => {
      if (client.isReady()) {
        resolve();
      } else {
        client.once('ready', resolve);
      }
    });
  }
  await logMessageOrError("new start of discord bot");

  //handleNewTrade("0xd235b3b1ac41f7eaa72e7de14019fddce08d81e8b20f32843d3480e90c78c431") // soul
  await setupContractEvents();
  await setupMongoDbConnection();

  // await handleBidAccepted("0x06d14fc4c7b60a8f318b50b676451c820cefe52548df142cc6e6da46f5f99599") // soul
  // await handleNewTrade("0xfbc9fe6e051e4a6d0762cc84b03a4dd7495ae0ad69eb0397fdf9a5c4b6dcec90")
  // await handleNewBid("0x503630bf4c15f29c39228c2156b4a0843d5817ea30bf0a00ba6fb12ecbeab72f") // soul
  initStats();

  cron.schedule("0 0 * * *", async () => {
    await publishSummary();
    try {
      await updateAllUsers();
    } catch (error) {
      await logMessageOrError(
        "there was in issue in the daily fetching of the users info (pb etc.)",
        error
      );
    }
  });
});

async function setupMongoDbConnection() {
  const uri = `mongodb+srv://${process.env.MONGODB_ACCESS}@cluster0.cbrbn.mongodb.net/evrloot?retryWrites=true&w=majority`;

  MongoClient.connect(uri).then((client, err) => {
    if (err) {
      logMessageOrError("Failed to connect to MongoDB:", err);
      return;
    } else {
      console.log("connected to mongodb client");
    }

    const collection = client.db("evrloot").collection("discordverifications");

    // Initialize change stream
    if (process.env.DISCORDJS_CLIENTID !== "1121489061115338773") {
      const changeStream = collection.watch([
        { $match: { operationType: "insert" } },
      ]);

      // Start listening to changes
      changeStream.on("change", (next) => {
        console.log(
          "new discord verification for id",
          next.fullDocument.discordName,
          "with",
          next.fullDocument.wallet
        );
        logMessageOrError(
          `new discord verification for discord name ${next.fullDocument.discordName} with wallet ${next.fullDocument.wallet}`
        );
        // sendVerificationDm(next.fullDocument.discordName, next.fullDocument.wallet)
      });

      // Handle errors (optional but recommended)
      changeStream.on("error", (error) => {
        logMessageOrError(
          "Error in dbconnection to discordverifications:",
          error
        );
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
  MISSION_CONTRACT.events
    .MissionReward({ fromBlock: "latest" })
    .on("connected", function (_subscriptionId) {
      console.log("[EVENT] connected to mission reward event, subscription ID:", _subscriptionId);
    })
    .on("data", function (event) {
      console.log("[EVENT] MissionReward event received:", {
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        tokenId: event.returnValues.tokenId,
        missionId: event.returnValues.missionId
      });
      fetchMissionReward(event).catch(error => {
        console.error("[EVENT] Error processing MissionReward event:", error);
        logMessageOrError("[EVENT] Error processing MissionReward:", error.message, error.stack);
      });
    })
    .on("error", function (error) {
      if (!error?.data?.range) {
        console.error("Error in MISSION_CONTRACT MissionReward", error);
        logMessageOrError("Error in MISSION_CONTRACT MissionReward:", error);
      }
    });

  MARKETPLACE_CONTRACT.events
    .BidCreated({ fromBlock: "latest" })
    .on("connected", function (_subscriptionId) {
      console.log("connected to bid created event");
    })
    .on("data", function (event) {
      handleNewBid(event.returnValues.bidId);
    })
    .on("error", function (error) {
      if (!error?.data?.range) {
        console.error("Error in MARKETPLACE_CONTRACT BidCreated", error);
        logMessageOrError("Error in MARKETPLACE_CONTRACT BidCreated:", error);
      }
    });

  MARKETPLACE_CONTRACT.events
    .TradeCreated({ fromBlock: "latest" })
    .on("connected", function (_subscriptionId) {
      console.log("connected to trade created event");
    })
    .on("data", function (event) {
      console.log("trade created event");

      handleNewTrade(event.returnValues.tradeId);
    })
    .on("error", function (error) {
      if (!error?.data?.range) {
        console.error("Error in MARKETPLACE_CONTRACT TradeCreated", error);
        logMessageOrError("Error in MARKETPLACE_CONTRACT TradeCreated:", error);
      }
    });

  MARKETPLACE_CONTRACT.events
    .BidAccepted({ fromBlock: "latest" })
    .on("connected", function (_subscriptionId) {
      console.log("connected to bid accepted event");
    })
    .on("data", function (event) {
      handleBidAccepted(event.returnValues.tradeId);
    })
    .on("error", function (error) {
      if (!error?.data?.range) {
        console.error("Error in MARKETPLACE_CONTRACT BidAccepted", error);
        logMessageOrError("Error in MARKETPLACE_CONTRACT BidAccepted:", error);
      }
    });

  EXPEDITION_CONTRACT.events
    .ExpeditionStart({ fromBlock: "latest" })
    .on("connected", function (_subscriptionId) {
      console.log("connected to expedition start event");
    })
    .on("data", function (_event) {
      console.log("increaseExpeditionCounter");
      increaseExpeditionCounter();
    })
    .on("error", function (error) {
      if (!error?.data?.range) {
        console.error("Error in EXPEDITION_CONTRACT ExpeditionStart", error);
        logMessageOrError(
          "Error in EXPEDITION_CONTRACT ExpeditionStart:",
          error
        );
      }
    });
}
