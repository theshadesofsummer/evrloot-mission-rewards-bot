const {MongoClient, ObjectId} = require('mongodb');

module.exports = {
  getAccountByWallet,
  getAllAccounts,
  updateDiscordInfo,
  getAllConnectedAccounts,
  getAllFighterAccounts,
  updateDiscordName,
  userWithWallet,
  updateDocument,
  deleteWallet,
  createNewFight,
  getOpenPoolFight,
  createNewFightInPool,
  addFighterToOpenPoolFight,
  getFightByFighters,
  getFightByFightId,
  getOutstandingInvitationWithSoul,
  addFightingSoul,
  getOpenInvitationsToYou,
  getOpenInvitationsFromYou,
  deleteFight,
  countPlayerCombination,
  addSoulCooldown,
  getSoulCooldown,
  getLeaderboardEntries,
  updateWinnerOnLeaderboard,
  addFightParticipants,
  getTradeMessages
}

const uri = `mongodb+srv://${process.env.MONGODB_ACCESS}@cluster0.cbrbn.mongodb.net/evrloot?retryWrites=true&w=majority`;

async function getAccountByWallet(wallet) {
  const client = await MongoClient.connect(uri);
  try {
    console.log('[DB]', 'getting account for wallet:', wallet)
    const collection = client.db("evrloot").collection("discordverifications");

    // Fetch the document
    const doc = await collection.findOne({wallet});

    if (doc === null || !doc.verified || doc.isAnonymous) {
      return undefined
    }

    return doc;
  } catch (error) {

    return undefined
  } finally {
    await client.close();
  }
}

async function getAllAccounts() {
  const client = await MongoClient.connect(uri);
  try {
    console.log('[DB]', 'getting all accounts')
    const collection = client.db("evrloot").collection("discordverifications");

    // Fetch the document
    return await collection.find().toArray();

  } catch (error) {
    return []
  } finally {
    await client.close();
  }
}

async function updateDiscordInfo(userId, username, avatarURL) {
  const client = await MongoClient.connect(uri);
  try {
    console.log('[DB]', 'update discord info for userId', userId)
    const collection = client.db("evrloot").collection("discordverifications");

    const filter = {
      discordId: userId,
    }

    return await collection.updateMany(filter, {$set: {discordName: username, avatarURL}});
  } catch (error) {

    return undefined
  } finally {
    await client.close();
  }
}

async function getAllFighterAccounts(userId) {
  const client = await MongoClient.connect(uri);
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
    return []
  } finally {
    await client.close();
  }
}

async function getAllConnectedAccounts(userId) {
  const client = await MongoClient.connect(uri);
  try {
    console.log('[DB]', 'getting all connected accounts for user:', userId)
    const collection = client.db("evrloot").collection("discordverifications");

    const filter = {
      discordId: userId
    }
    // Fetch the documents
    return await collection.find(filter).toArray();
  } catch (error) {
    return []
  } finally {
    await client.close();
  }
}

async function updateDiscordName(id, discordName) {
  const client = await MongoClient.connect(uri);
  try {
    console.log('[DB]', 'updating doc id', id, 'to discord name:', discordName)
    const collection = client.db("evrloot").collection("discordverifications");

    await collection.updateOne({_id: id}, {$set: {discordName}});
  } catch (error) {
    return []
  } finally {
    await client.close();
  }
}

async function userWithWallet(userId, address) {
  const client = await MongoClient.connect(uri);
  try {
    console.log('[DB]', 'get user wallet combination. user:', userId, 'wallet:', address)
    const collection = client.db("evrloot").collection("discordverifications");

    // Fetch the documents
    const doc = await collection.findOne({discordId: userId, wallet: address})
    console.log('[DB]', 'found user wallet combination:', doc)
    return doc
  } catch (error) {
    return undefined
  } finally {
    await client.close();
  }
  return undefined
}

async function updateDocument(filter, updateData) {
  const client = await MongoClient.connect(uri);
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
    await collection.updateOne(filter, {$set: updateData});
  } catch (error) {
  } finally {
    await client.close();
  }
}

async function deleteWallet(address) {
  const client = await MongoClient.connect(uri);
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
  } finally {
    await client.close();
  }
}

async function createNewFight(fighterA, fighterB) {
  const client = await MongoClient.connect(uri);
  try {
    console.log('[DB]', 'creating a new fight with fighterA:', fighterA, 'fighterB:', fighterB)
    const collection = client.db("evrloot").collection("discordfights");

    return await collection.insertOne({fighterA, fighterB});
  } catch (error) {
  } finally {
    await client.close();
  }
}

async function getFightByFighters(fighterA, fighterB) {
  const client = await MongoClient.connect(uri);
  try {
    console.log('[DB]', 'get a fight by fighters with fighterA:', fighterA, 'fighterB:', fighterB)
    const collection = client.db("evrloot").collection("discordfights");

    return await collection.findOne({fighterA, fighterB});
  } catch (error) {
    return undefined;
  } finally {
    await client.close();
  }
}

async function getFightByFightId(fightId) {
  const client = await MongoClient.connect(uri);
  try {
    console.log('[DB]', 'get a fight by fightId:', fightId)
    const collection = client.db("evrloot").collection("discordfights");

    const fightObjectId = new ObjectId(fightId)
    return await collection.findOne({_id: fightObjectId})
  } catch (error) {
  } finally {
    await client.close();
  }
}

async function getOutstandingInvitationWithSoul(soulId) {
  const client = await MongoClient.connect(uri);
  try {
    console.log('[DB]', 'check if a soul', soulId, 'is in an open invitation')
    const collection = client.db("evrloot").collection("discordfights");

    return await collection.findOne({fighterA: soulId});
  } catch (error) {
    return undefined;
  } finally {
    await client.close();
  }
}

async function addFightingSoul(fightId, soulId, firstFighter) {
  const client = await MongoClient.connect(uri);
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
    await collection.updateOne({_id: fightObjectId}, {$set: soulToAdd});
  } catch (error) {
  } finally {
    await client.close();
  }
}

async function getOpenPoolFight(discordId) {
  const client = await MongoClient.connect(uri);
  try {
    console.log('[DB]', 'get open fight in pool')
    const collection = client.db("evrloot").collection("discordfights");

    // Fetch the document
    const doc = await collection.findOne({fighterA: {$ne: null}, discordIdA: {$ne: discordId}, fighterB: null});

    if (!doc) {
      console.log('[DB]', 'no open fight found');
      return;
    }

    console.log('[DB]', 'fight found', doc);
    return doc
  } catch (error) {
  } finally {
    await client.close();
  }
}

async function createNewFightInPool(soulId, discordId) {
  const client = await MongoClient.connect(uri);
  try {
    console.log('[DB]', 'createNewFightInPool', soulId)
    const collection = client.db("evrloot").collection("discordfights");

    // Fetch the document
    return await collection.insertOne({fighterA: soulId, discordIdA: discordId});
  } catch (error) {
  } finally {
    await client.close();
  }
}

async function addFighterToOpenPoolFight(openPoolFightId, soulId, discordId) {
  const client = await MongoClient.connect(uri);
  try {
    console.log('[DB]', 'add', soulId, 'to the fight', openPoolFightId, 'with supplier', discordId)
    const collection = client.db("evrloot").collection("discordfights");

    // Fetch the document
    const doc = await collection.findOne({_id: openPoolFightId})

    if (!doc) {
      console.log('[DB]', 'no fight found with the id', openPoolFightId);
      return;
    }

    // Update the document with provided data
    await collection.updateOne({_id: openPoolFightId}, {$set: {fighterB: soulId, discordIdB: discordId}});
    return await collection.findOne({_id: openPoolFightId})
  } catch (error) {
  } finally {
    await client.close();
  }
}

async function getOpenInvitationsToYou(userId) {
  const client = await MongoClient.connect(uri);
  try {

    console.log('[DB]', 'get all open invitations to', userId)
    const collection = client.db("evrloot").collection("discordfights");

    return await collection.find({fighterB: userId, soulA: {$exists: true}}).toArray();
  } catch (error) {
  } finally {
    await client.close();
  }
}

async function getOpenInvitationsFromYou(userId, withFighter) {
  const client = await MongoClient.connect(uri);
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

async function deleteFight(openPoolFight) {
  const client = await MongoClient.connect(uri);
  try {
    console.log('[DB]', 'delete fight by id', openPoolFight._id)
    const collection = client.db("evrloot").collection("discordfights");

    return await collection.deleteOne({_id: openPoolFight._id});
  } catch (error) {
  } finally {
    await client.close();
  }
}

async function addSoulCooldown(soulId, timestamp) {
  const client = await MongoClient.connect(uri);
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
  const client = await MongoClient.connect(uri);
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
    return undefined
  } finally {
    await client.close();
  }
}

async function getLeaderboardEntries() {
  const client = await MongoClient.connect(uri);
  try {
    console.log('[DB]', 'get leaderboard')
    const collection = client.db("evrloot").collection("fightwins");

    return await collection.find({}).toArray()
  } catch (error) {
  } finally {
    await client.close();
  }
}

async function updateWinnerOnLeaderboard(soulId, soulName, winner) {
  console.log('soulName', soulName)
  const client = await MongoClient.connect(uri);
  try {
    const collection = client.db("evrloot").collection("fightwins");

    const winnerDoc = await collection.findOne({soulId});

    const winPoints = winner ? 3 : 1
    if (!winnerDoc) {
      const newWins = winner ?
        {wins: 1, losses: 0} :
        {wins: 0, losses: 1}
      console.log('[DB] creating new leaderboard entry for', soulId, 'with winner', winner, '>>>', soulName)
      await collection.insertOne({soulId, soulName, amount: winPoints, ...newWins});
    } else {
      const updateValues = winner ?
        {amount: winnerDoc.amount + winPoints, wins: winnerDoc.wins + 1} :
        {amount: winnerDoc.amount + winPoints, losses: winnerDoc.losses + 1}
      console.log('[DB] updating leaderboard entry for', soulId, 'to', updateValues, '>>>', soulName)
      await collection.updateOne({_id: winnerDoc._id}, {$set: updateValues})
    }
  } catch (error) {
  } finally {
    await client.close();
  }
}

async function countPlayerCombination(playerA, playerB) {
  const client = await MongoClient.connect(uri);
  try {
    const collection = client.db("evrloot").collection("fightplayercombinations");

    const winnerDoc = await collection.findOne({playerA, playerB});

    if (!winnerDoc) {
      console.log('[DB] creating new combination entry for', playerA, 'and', playerB)
      await collection.insertOne({playerA, playerB, amount: 1});
    } else {
      console.log('[DB] updating combination entry for', playerA, 'and', playerB, 'to amount', winnerDoc.amount + 1)
      await collection.updateOne({_id: winnerDoc._id}, {$set: {amount: winnerDoc.amount + 1}})
    }
  } catch (error) {
  } finally {
    await client.close();
  }
}


async function addFightParticipants(discordId) {
  const client = await MongoClient.connect(uri);
  try {
    const collection = client.db("evrloot").collection("fightparticipants");

    const participantDoc = await collection.findOne({discordId});

    if (!participantDoc) {
      console.log('[DB] creating new participant entry for', discordId)
      await collection.insertOne({discordId});
    } else {
      console.log('[DB] participant already added', discordId)
    }
  } catch (error) {
  } finally {
    await client.close();
  }
}

async function getTradeMessages(tradeId) {
  const client = await MongoClient.connect(uri);
  try {
    console.log('[DB]', 'get trade messages', tradeId)
    const collection = client.db("evrloot").collection("trademessages");

    const tradeMessagesDoc = await collection.findOne({tradeId});

    if (!tradeMessagesDoc) {
      console.warn('[DB] no trade message for', tradeId)
    }

    return tradeMessagesDoc
  } catch (error) {
    return undefined
  } finally {
    await client.close();
  }
}