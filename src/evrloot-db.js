const {MongoClient, ObjectId} = require('mongodb');

module.exports = {
  getAccountName,
  getConnectedAccounts,
  userWithWallet,
  updateDocument,
  deleteWallet,
  createNewFight,
  getFightByFighters,
  getFightByFightId,
  getOutstandingInvitationWithSoul,
  addFightingSoul,
  getOpenInvitationsToYou,
  getOpenInvitationsFromYou,
  deleteFight,
  saveFightResult,
  addSoulCooldown,
  getSoulCooldown
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

async function getConnectedAccounts(username, onlyVerified = true) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    const collection = client.db("evrloot").collection("discordverifications");

    console.log('fetching wallets for', username)

    const filter = onlyVerified ? {
      discordId: username,
      verified: true
    } : {
      discordId: username
    }
    // Fetch the documents
    return await collection.find(filter).toArray();
  } catch (error) {
    console.error('db error while trying to find wallets for:', filter, error);
    return []
  } finally {
    await client.close();
  }
}

async function userWithWallet(username, address) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    const collection = client.db("evrloot").collection("discordverifications");

    console.log('checks if user with wallet exists for', username, address)
    // Fetch the documents
    const doc = await collection.findOne({discordId: username, wallet: address})
    console.log('found doc:', doc)
    return doc
  } catch (error) {
    console.error('db error while trying to check if user has wallet for:', username, address, error);
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
      console.log("Document not found with filter:", address);
      return;
    }

    // Update the document with provided data
    await collection.deleteOne({wallet: address});
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

async function getOutstandingInvitationWithSoul(soulId) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    const collection = client.db("evrloot").collection("discordfights");

    return await collection.findOne({soulA: soulId});
  } catch (error) {
    console.error('Error searching for a running fight', error);
    return undefined;
  } finally {
    await client.close();
  }
}

async function addFightingSoul(fightId, soulId, firstFighter) {
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
    const soulToAdd = firstFighter ? {soulA: soulId} : {soulB: soulId}
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

async function saveFightResult(fightResult){
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    const collection = client.db("evrloot").collection("fightresults");

    await collection.insertOne({fightResult});
  } catch (error) {
    console.error('Error inserting the fight results', error);
  } finally {
    await client.close();
  }
}

async function addSoulCooldown(soulId, timestamp){
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    console.log(soulId, timestamp)
    const collection = client.db("evrloot").collection("fightcooldowns");

    await collection.insertOne({soul: soulId, cooldownUntil: timestamp});
    console.log('successful adding of cooldown')
  } catch (error) {
    console.error('Error adding the soul cooldowns', error);
  } finally {
    await client.close();
  }
}

async function getSoulCooldown(soulId) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    const collection = client.db("evrloot").collection("fightcooldowns");

    const cooldownDoc = await collection.findOne({soul: soulId});
    if (!cooldownDoc) {
      return undefined
    }

    if (cooldownDoc.cooldownUntil < Math.round(Date.now() / 1000)) {
      await collection.deleteOne({soul: soulId})
      return undefined
    }

    return cooldownDoc;
  } catch (error) {
    console.error('Error getting the soul cooldowns', error);
    return undefined
  } finally {
    await client.close();
  }
}