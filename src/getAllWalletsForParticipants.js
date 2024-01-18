const {MongoClient} = require("mongodb");
require('dotenv').config();

const uri = `mongodb+srv://${process.env.MONGODB_ACCESS}@cluster0.cbrbn.mongodb.net/evrloot?retryWrites=true&w=majority`;

MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }).then(async (client, err) => {
  if (err) {
    console.error('Failed to connect', err);
    return;
  } else {
    console.log('connected to mongodb client')
  }

  const walletConnections = new Map()

  const participantCollection = client.db("evrloot").collection("fightparticipants");
  const participants = await participantCollection.find({}).toArray();

  const discordConnectionCollection = client.db("evrloot").collection("discordverifications");
  const walletsCursors = participants.map(participant => discordConnectionCollection.find({discordId: participant.discordId}),)

  await Promise.all(walletsCursors)
  for (const cursor of walletsCursors) {
    while (await cursor.hasNext()) {
      const discordConnection = await cursor.next();

      if (!walletConnections.has(discordConnection.discordId)) {
        walletConnections.set(discordConnection.discordId, [discordConnection.wallet])
      } else {
        walletConnections.get(discordConnection.discordId).push(discordConnection.wallet)
      }

    }
  }

  console.log('walletConnections', walletConnections)
})
