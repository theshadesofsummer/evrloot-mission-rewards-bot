const {MongoClient, ObjectId} = require('mongodb');

module.exports = {
  getAccountName,
  getConnectedWallets,
  userWithWallet,
  updateDocument,
  deleteDocument,
  createNewFight,
  getRunningFight,
  soulIsNotInFight,
  addFightingSoul,
}

const uri = `mongodb+srv://${process.env.MONGODB_ACCESS}@cluster0.cbrbn.mongodb.net/evrloot?retryWrites=true&w=majority`;

async function getAccountName(filter) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    const collection = client.db("evrloot").collection("discordverifications");

    // Fetch the document
    const doc = await collection.findOne(filter);

    console.log(doc);

    if (doc === null || !doc.verified) {
      return 'An unknown traveller'
    }

    console.log('(3)', doc.isAnonymous)
    if (doc.isAnonymous) {
      return 'An anonymous traveller'
    }

    return doc.discordId;
  } catch (error) {
    console.error('db error while trying to find:', error);
    return 'A unknown traveller'
  } finally {
    await client.close();
  }
}

async function getConnectedWallets(filter) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    const collection = client.db("evrloot").collection("discordverifications");

    console.log('fetching wallets for', filter)
    // Fetch the documents
    const docs = await collection.find(filter).toArray();
    console.log('found wallets', docs)
    return docs.map(doc => doc.wallet)
  } catch (error) {
    console.error('db error while trying to find wallets for:', filter, error);
    return undefined
  } finally {
    await client.close();
  }
}

async function userWithWallet(filter) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    const collection = client.db("evrloot").collection("discordverifications");

    console.log('checks if user with wallet exists for', filter)
    // Fetch the documents
    const doc = await collection.findOne(filter)
    console.log('found doc:', doc)
    return doc
  } catch (error) {
    console.error('db error while trying to check if user has wallet for:', filter, error);
    return undefined
  } finally {
    await client.close();
  }
  return undefined
}

async function updateDocument(filter, updateData) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    const collection = client.db("evrloot").collection("discordverifications");

    // Fetch the document
    const doc = await collection.findOne(filter);

    if (!doc) {
      console.log("Document not found with filter:", filter);
      return;
    }

    // Update the document with provided data
    await collection.updateOne(filter, { $set: updateData });
    console.log("Document updated successfully");

  } catch (error) {
    console.error('Error updating the document', error);
  } finally {
    await client.close();
  }
}

async function deleteDocument(filter) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    const collection = client.db("evrloot").collection("discordverifications");

    // Fetch the document
    const doc = await collection.findOne(filter);

    if (!doc) {
      console.log("Document not found with filter:", filter);
      return;
    }

    // Update the document with provided data
    await collection.deleteOne(filter);
    console.log("Document deleted successfully");

  } catch (error) {
    console.error('Error deleted the document', error);
  } finally {
    await client.close();
  }
}

async function createNewFight(fighterA, fighterB) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    const collection = client.db("evrloot").collection("discordfights");

    return await collection.insertOne({fighterA, fighterB});
  } catch (error) {
    console.error('Error creating the new fight', error);
  } finally {
    await client.close();
  }
}

async function getRunningFight(fighterA, fighterB) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    const collection = client.db("evrloot").collection("discordfights");

    return await collection.findOne({fighterA, fighterB});
  } catch (error) {
    console.error('Error searching for a running fight', error);
  } finally {
    await client.close();
  }
}

async function soulIsNotInFight(soul) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    const collection = client.db("evrloot").collection("discordfights");

    const fight = await collection.findOne({soulA: soul.id});
    console.log('fight', fight)

    if (!fight) {
      console.log('soul is not in fight')
      return true
    } else {
      console.log('soul is in fight')
      return false
    }

  } catch (error) {
    console.error('Error searching for a running fight', error);
  } finally {
    await client.close();
  }
}

async function addFightingSoul(fightId, soul, firstFighter) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    const collection = client.db("evrloot").collection("discordfights");

    // Fetch the document
    const fightObjectId = new ObjectId(fightId)
    const doc = await collection.findOne({_id: fightObjectId});

    if (!doc) {
      console.log("fight not found with id:", fightId);
      return;
    }

    // Update the document with provided data
    const soulToAdd = firstFighter ? {soulA: soul} : {soulB: soul}
    await collection.updateOne({_id: fightObjectId}, { $set: soulToAdd});
    console.log("fight updated successfully");

  } catch (error) {
    console.error('Error updating the fight', error);
  } finally {
    await client.close();
  }
}