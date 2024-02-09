const {MongoClient} = require("mongodb");

module.exports = {
  getEvrmonForDiscordId,
  saveEvrmon
}

const uri = `mongodb+srv://${process.env.MONGODB_ACCESS}@cluster0.cbrbn.mongodb.net/evrloot?retryWrites=true&w=majority`;

async function getEvrmonForDiscordId(discordId) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    console.log('[DB]', 'getting evrmon for discordId:', discordId)
    const collection = client.db("evrloot").collection("evrmons");

    // Fetch the document
    const doc = await collection.findOne({id: discordId});

    if (doc === null) {
      return undefined
    }

    return doc;
  } catch (error) {
    console.error('[DB] getting evrmon for discordId', discordId, 'failed:', error);
    return undefined
  } finally {
    await client.close();
  }
}

async function saveEvrmon(discordId, newEvrmon) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    console.log('[DB]', 'saving evrmon for discordId:', discordId)
    const collection = client.db("evrloot").collection("evrmons");

    await collection.insertOne(newEvrmon);
  } catch (error) {
    console.error('[DB] saving evrmon for discordId', discordId, 'failed:', error);
    return undefined
  } finally {
    await client.close();
  }
}

