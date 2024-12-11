const {fetchTradeByIdFromSquid, getSoulFromBackend, getSoulImage, getCitizenImage} = require("../evrloot-api");
const {postNewTrade, postNewTradeWithImage} = require("../discord-client");
const createNewTradeEmbed = require('../embeds/new-trade-embed')
const createNewSoulTradeEmbed = require('../embeds/new-soul-trade-embed')
const resourceRewards = require("../mappings/resource-types");
const {getTradeMessages, getAccountByWallet} = require("../evrloot-db");
const {
  getSoulMetadataForTrade,
  getNftWithMetadata,
  getDiscordUserForWallet,
  getResourcesWithMetadata
} = require("./trade-helpers");
const fs = require("fs");
const {AttachmentBuilder} = require("discord.js");

module.exports = {
  handleNewTrade
}

async function handleNewTrade(tradeId) {
  console.log('handle new trade event with', tradeId)

  await new Promise(resolve => setTimeout(resolve, 10000));
  const tradeInfo = await fetchTradeByIdFromSquid(tradeId)

  if (!tradeInfo) {
    return;
  }

  const textInfo = await getTradeMessages(tradeInfo.id)

  const tradeCreator = await getDiscordUserForWallet(tradeInfo.ownerAddress)

  if (isSoulTrade(tradeInfo)) {
    console.log('is soul trade true')
    const soul = await getSoulMetadataForTrade(tradeInfo);

    let soulImageBuffer;
    let imageFileName;
    if (soul.id.startsWith("CITIZENS")) {
      soulImageBuffer = await getCitizenImage(soul.tokenId);
      imageFileName = `citizen_${soul.tokenId}.png`;
    } else {
      soulImageBuffer = await getSoulImage(soul.tokenId)
      imageFileName = `soul_${soul.tokenId}.png`;
    }

    let path = 'static/'+imageFileName;
    fs.createWriteStream(path).write(soulImageBuffer);
    fs.createWriteStream(path).close();

    const attachments = new AttachmentBuilder()
      .setFile(path)
      .setName(imageFileName)

    const newTradeEmbed = createNewSoulTradeEmbed(tradeInfo, textInfo, tradeCreator, soul, imageFileName)
    await postNewTradeWithImage(newTradeEmbed, attachments)

    fs.unlink(path, (err) => {
      if (err) {
        console.error('Error removing file:', err);
        return;
      }
      console.log('File removed successfully:', path);
    });
  } else {
    const tradeNfts = await getNftWithMetadata(tradeInfo.erc721s, tradeInfo.unclaimedNfts)
    const tradeResources = await getResourcesWithMetadata(tradeInfo.erc1155s, tradeInfo.unclaimedResources)

    const newTradeEmbed = createNewTradeEmbed(tradeInfo, textInfo, tradeCreator, tradeNfts, tradeResources)
    await postNewTrade(newTradeEmbed)
  }
}

const estraTokenNftAddress = '0xba6bd2aace40c9a14c4123717119a80e9fe6738a' // identify if soul is staked => fetch via estra token
const soulNftAddress = '0x9d1454e198f4b601bfc0069003045b0cbc0e6749'

function isSoulTrade(tradeInfo) {
  console.log('is soul trade')
  if (tradeInfo.erc1155s.length > 0 || tradeInfo.unclaimedResources.length > 0) return false
  console.log('not 1', tradeInfo.erc721s.length, tradeInfo.unclaimedNfts.length)
  if (tradeInfo.erc721s.length + tradeInfo.unclaimedNfts.length !== 1) return false
  console.log('not 2')
  if (tradeInfo.erc721s[0]) return tradeInfo.erc721s[0].contractAddress.toLowerCase() === estraTokenNftAddress
  console.log('not 3')
  return tradeInfo.unclaimedNfts[0].contractAddress.toLowerCase() === soulNftAddress
}
