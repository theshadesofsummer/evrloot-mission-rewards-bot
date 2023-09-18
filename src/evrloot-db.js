const {MongoClient, ObjectId} = require('mongodb');

module.exports = {
  getAccountName,
  getAllConnectedAccounts,
  getAllFighterAccounts,
  updateDiscordName,
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
  getSoulCooldown,
  getLeaderboardEntries,
  updateWinnerOnLeaderboard
}

const uri = `mongodb+srv://${process.env.MONGODB_ACCESS}@cluster0.cbrbn.mongodb.net/evrloot?retryWrites=true&w=majority`;

async function getAccountName(wallet) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    console.log('[DB]', 'getting account name for wallet:', wallet)
    const collection = client.db("evrloot").collection("discordverifications");

    // Fetch the document
    const doc = await collection.findOne({wallet});

    if (doc === null || !doc.verified) {
      return 'An unknown traveller'
    }

    if (doc.isAnonymous) {
      return 'An anonymous traveller'
    }

    return doc.discordName;
  } catch (error) {
    console.error('[DB] getting account name for address failed.', error);
    return 'A unknown traveller'
  } finally {
    await client.close();
  }
}

async function getAllFighterAccounts(userId) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    console.log('[DB]', 'getting verified and non anonymous accounts for user:', userId)
    const collection = client.db("evrloot").collection("discordverifications");

    const filter = {
      discordId: userId,
      verified: true,
      isAnonymous: false
    }
    // Fetch the documents
    return await collection.find(filter).toArray();
  } catch (error) {
    console.error('[DB] getting verified and non anonymous accounts failed.', error);
    return []
  } finally {
    await client.close();
  }
}

async function getAllConnectedAccounts(userId) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    console.log('[DB]', 'getting all connected accounts for user:', userId)
    const collection = client.db("evrloot").collection("discordverifications");

    const filter = {
      discordId: userId
    }
    // Fetch the documents
    return await collection.find(filter).toArray();
  } catch (error) {
    console.error('[DB] all connected accounts failed.', error);
    return []
  } finally {
    await client.close();
  }
}

async function updateDiscordName(id, discordName) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    console.log('[DB]', 'updating doc id', id, 'to discord name:', discordName)
    const collection = client.db("evrloot").collection("discordverifications");

    await collection.updateOne({_id: id}, {$set: {discordName}});
  } catch (error) {
    console.error('[DB] updating doc id', id, 'to discord name:', discordName, 'failed.', error);
    return []
  } finally {
    await client.close();
  }
}

async function userWithWallet(userId, address) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    console.log('[DB]', 'get user wallet combination. user:', userId, 'wallet:', address)
    const collection = client.db("evrloot").collection("discordverifications");

    // Fetch the documents
    const doc = await collection.findOne({discordId: userId, wallet: address})
    console.log('[DB]', 'found user wallet combination:', doc)
    return doc
  } catch (error) {
    console.error('[DB] finding user wallet combination failed.', error);
    return undefined
  } finally {
    await client.close();
  }
  return undefined
}

async function updateDocument(filter, updateData) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    console.log('[DB]', 'updating a verification for filter:', filter, 'with updateData:', updateData)

    const collection = client.db("evrloot").collection("discordverifications");

    // Fetch the document
    const doc = await collection.findOne(filter);

    if (!doc) {
      console.log('[DB]', 'no document found');
      return;
    }

    // Update the document with provided data
    await collection.updateOne(filter, { $set: updateData });
  } catch (error) {
    console.error('[DB]', 'Error updating the document', error);
  } finally {
    await client.close();
  }
}

async function deleteWallet(address) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    console.log('[DB]', 'deleting the entry with the wallet:', address)
    const collection = client.db("evrloot").collection("discordverifications");

    // Fetch the document
    const doc = await collection.findOne({wallet: address});

    if (!doc) {
      console.log('[DB]', 'could not find an entry to delete with the wallet:', address);
      return;
    }

    // Update the document with provided data
    await collection.deleteOne({wallet: address});
  } catch (error) {
    console.error('[DB]', 'Error deleting the document', error);
  } finally {
    await client.close();
  }
}

async function createNewFight(fighterA, fighterB) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    console.log('[DB]', 'creating a new fight with fighterA:', fighterA, 'fighterB:', fighterB)
    const collection = client.db("evrloot").collection("discordfights");

    return await collection.insertOne({fighterA, fighterB});
  } catch (error) {
    console.error('[DB]', 'Error creating the new fight', error);
  } finally {
    await client.close();
  }
}

async function getFightByFighters(fighterA, fighterB) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    console.log('[DB]', 'get a fight by fighters with fighterA:', fighterA, 'fighterB:', fighterB)
    const collection = client.db("evrloot").collection("discordfights");

    return await collection.findOne({fighterA, fighterB});
  } catch (error) {
    console.error('[DB]', 'error getting a fight by both fighterNames', error);
    return undefined;
  } finally {
    await client.close();
  }
}

async function getFightByFightId(fightId) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    console.log('[DB]', 'get a fight by fightId:', fightId)
    const collection = client.db("evrloot").collection("discordfights");

    const fightObjectId = new ObjectId(fightId)
    return await collection.findOne({_id: fightObjectId})
  } catch (error) {
    console.error('[DB]', 'error getting a fight by fightId', error);
  } finally {
    await client.close();
  }
}

async function getOutstandingInvitationWithSoul(soulId) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    console.log('[DB]', 'check if a soul', soulId, 'is in an open invitation')
    const collection = client.db("evrloot").collection("discordfights");

    return await collection.findOne({soulA: soulId});
  } catch (error) {
    console.error('[DB]', 'Error searching for an open invitation by soulId', error);
    return undefined;
  } finally {
    await client.close();
  }
}

async function addFightingSoul(fightId, soulId, firstFighter) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    console.log('[DB]', 'add', soulId, 'to the fight', fightId, 'as the firstFighter', firstFighter)
    const collection = client.db("evrloot").collection("discordfights");

    // Fetch the document
    const fightObjectId = new ObjectId(fightId)
    const doc = await collection.findOne({_id: fightObjectId});

    if (!doc) {
      console.log('[DB]', 'no fight found with the id', fightId);
      return;
    }

    // Update the document with provided data
    const soulToAdd = firstFighter ? {soulA: soulId} : {soulB: soulId}
    await collection.updateOne({_id: fightObjectId}, { $set: soulToAdd});
  } catch (error) {
    console.error('[DB]', 'Error adding the soul to the fight', error);
  } finally {
    await client.close();
  }
}

async function getOpenInvitationsToYou(userId) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {

    console.log('[DB]', 'get all open invitations to', userId)
    const collection = client.db("evrloot").collection("discordfights");

    return await collection.find({fighterB: userId, soulA: {$exists: true}}).toArray();
  } catch (error) {
    console.error('[DB]', 'Error getting all open invitations to oneself', error);
  } finally {
    await client.close();
  }
}

async function getOpenInvitationsFromYou(userId, withFighter) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    console.log('[DB]', 'get all open invitations from', userId)
    const collection = client.db("evrloot").collection("discordfights");

    const filter = withFighter ?
      {fighterA: userId, soulA: {$exists: true}} :
      {fighterA: userId, soulA: {$exists: false}}
    return await collection.find(filter).toArray();
  } catch (error) {
    console.error('[DB]', 'Error getting all open invitations to oneself', error);
  } finally {
    await client.close();
  }
}

async function deleteFight(fightId) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    console.log('[DB]', 'delete fight by id', fightId)
    const collection = client.db("evrloot").collection("discordfights");

    return await collection.deleteOne({_id: new ObjectId(fightId)});
  } catch (error) {
    console.error('[DB]', 'Error deleting the fight', error);
  } finally {
    await client.close();
  }
}

async function saveFightResult(fightResult){
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    console.log('[DB]', 'saving a fightResult for luuu to get fight data')
    const collection = client.db("evrloot").collection("fightresults");

    await collection.insertOne({fightResult});
  } catch (error) {
    console.error('[DB]', 'Error saving the fight result', error);
  } finally {
    await client.close();
  }
}

async function addSoulCooldown(soulId, timestamp){
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    console.log('[DB]', 'adding a cooldown on soul', soulId, 'until', timestamp)
    const collection = client.db("evrloot").collection("fightcooldowns");

    await collection.insertOne({soul: soulId, cooldownUntil: timestamp});
  } catch (error) {
    console.error('[DB]', 'Error adding the soul cooldown', error);
  } finally {
    await client.close();
  }
}

async function getSoulCooldown(soulId) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    console.log('[DB]', 'get the cooldown from a soul', soulId)
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
    console.error('[DB]', 'Error getting the soul cooldown', error);
    return undefined
  } finally {
    await client.close();
  }
}

async function getLeaderboardEntries(){
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    console.log('[DB]', 'get leaderboard')
    const collection = client.db("evrloot").collection("fightwins");

    return await collection.find({}).toArray()
  } catch (error) {
    console.error('[DB] Error getting the fight leaderboard');
  } finally {
    await client.close();
  }
}

async function updateWinnerOnLeaderboard(discordId){
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    const collection = client.db("evrloot").collection("fightwins");

    const winnerDoc = await collection.findOne({discordId});

    if (!winnerDoc) {
      console.log('[DB] creating new leaderboard entry for', discordId)
      await collection.insertOne({discordId, amount: 1});
    } else {
      console.log('[DB] updating leaderboard entry for', discordId, 'to wincount', winnerDoc.amount + 1)
      await collection.updateOne({_id: winnerDoc._id}, { $set: {amount: winnerDoc.amount + 1}})
    }
  } catch (error) {
    console.error('[DB] Error adding the win to leaderboard for', discordId, error);
  } finally {
    await client.close();
  }
}