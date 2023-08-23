const {MongoClient, ObjectId} = require('mongodb');

module.exports = {
  getAccountName,
  getConnectedWallets,
  userWithWallet,
  updateDocument,
  deleteWallet,
  createNewFight,
  getFightByFighters,
  getFightByFightId,
  soulIsNotInFight,
  addFightingSoul,
  getOpenInvitationsToYou,
  getOpenInvitationsFromYou,
  deleteFight,
}

const uri = `mongodb+srv://${process.env.MONGODB_ACCESS}@cluster0.cbrbn.mongodb.net/evrloot?retryWrites=true&w=majority`;

async function getAccountName(filter) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    const collection = client.db("evrloot").collection("discordverifications");

    // Fetch the document
    const doc = await collection.findOne(filter);

    if (doc === null || !doc.verified) {
      return 'An unknown traveller'
    }

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

async function getConnectedWallets(username) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    const collection = client.db("evrloot").collection("discordverifications");

    console.log('fetching wallets for', username)
    // Fetch the documents
    const docs = await collection.find({
      discordId: username,
      verified: true
    }).toArray();

    console.log('found wallets', docs)
    return docs.map(doc => doc.wallet)
  } catch (error) {
    console.error('db error while trying to find wallets for:', filter, error);
    return undefined
  } finally {
    await client.close();
  }
}

async function userWithWallet(username, address) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    const collection = client.db("evrloot").collection("discordverifications");

    console.log('checks if user with wallet exists for', filter)
    // Fetch the documents
    const doc = await collection.findOne({discordId: username, wallet: address})
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

async function deleteWallet(address) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    const collection = client.db("evrloot").collection("discordverifications");

    // Fetch the document
    const doc = await collection.findOne({wallet: address});

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

async function getFightByFighters(fighterA, fighterB) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    const collection = client.db("evrloot").collection("discordfights");

    return await collection.findOne({fighterA, fighterB});
  } catch (error) {
    console.error('Error searching for a running fight', error);
    return undefined;
  } finally {
    await client.close();
  }
}

async function getFightByFightId(fightId) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    const collection = client.db("evrloot").collection("discordfights");

    const fightObjectId = new ObjectId(fightId)
    return await collection.findOne({_id: fightObjectId})
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

async function getOpenInvitationsToYou(username) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    const collection = client.db("evrloot").collection("discordfights");

    return await collection.find({fighterB: username, soulA: {$exists: true}}).toArray();
  } catch (error) {
    console.error('Error updating the fight', error);
  } finally {
    await client.close();
  }
}

async function getOpenInvitationsFromYou(username, withFighter) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    const collection = client.db("evrloot").collection("discordfights");

    const filter = withFighter ?
      {fighterA: username, soulA: {$exists: true}} :
      {fighterA: username, soulA: {$exists: false}}
    return await collection.find(filter).toArray();
  } catch (error) {
    console.error('Error updating the fight', error);
  } finally {
    await client.close();
  }
}

async function deleteFight(fightId) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    const collection = client.db("evrloot").collection("discordfights");

    return await collection.deleteOne({_id: fightId});
  } catch (error) {
    console.error('Error deleting the fight', error);
  } finally {
    await client.close();
  }
}