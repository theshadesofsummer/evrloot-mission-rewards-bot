const {MongoClient} = require('mongodb');

module.exports = {
  getAccountName,
  updateDocument,
  deleteDocument
}

const uri = `mongodb+srv://${process.env.MONGODB_ACCESS}@cluster0.cbrbn.mongodb.net/evrloot?retryWrites=true&w=majority`;

async function getAccountName(filter) {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    const collection = client.db("evrloot").collection("discordverifications");

    // Fetch the document
    const doc = await collection.findOne(filter);

    if (!doc || !doc.verified || doc.verified === false) {
      return 'An unknown traveller'
    }

    if (doc.isAnonymous === undefined || doc.isAnonymous) {
      return 'An anonymous traveller'
    }

    return doc.discordId;
  } catch (error) {
    console.error('db error while trying to find:', error);
    return undefined
  } finally {
    await client.close();
  }

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