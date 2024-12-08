require('dotenv').config();
const {MongoClient} = require('mongodb');
const {client, logMessageOrError} = require("./discord-client");
const {setupDiscordBot} = require("./setup-discord-bot");

setupDiscordBot().then(() => {
  MongoClient.connect(`mongodb+srv://${process.env.MONGODB_ACCESS}@cluster0.cbrbn.mongodb.net/evrloot?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(async dbClient => {
    try {
      const collection = dbClient.db("evrloot").collection("discordverifications");

      const cursor = collection.find({});
      while (await cursor.hasNext()) {
        const doc = await cursor.next();

        const discordId = await getDiscordIdFor(doc.discordName)

        await collection.updateOne({_id: doc._id}, {$set: {discordId}})
      }
    } catch (error) {
      await logMessageOrError('Error in migrate-new-verifications', error)
    } finally {
      await dbClient.close();
    }
  })
})


async function getDiscordIdFor(discordName) {
  await client.guilds.fetch();
  const guild = client.guilds.cache.get(process.env.GUILD_ID);

  const memberMap = await guild.members.fetch({query: discordName, limit: 10})

  let id = '0';
  memberMap.forEach(member => {
    const username = member.user.username;
    console.log(discordName, username, discordName === username)
    if (discordName === username) {
      id = member.id
    }
  })
  return id
}