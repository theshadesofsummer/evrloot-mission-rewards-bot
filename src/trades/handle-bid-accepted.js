const {
  fetchTradeByIdFromSquid,
  getFromIpfs,
  fetchNftMetadataByIdAndCollection,
  fetchBidByIdFromSquid, getCitizenImage, getSoulImage
} = require("../evrloot-api");
const {postNewTrade, getUserByClientId, logMessageOrError, postNewTradeWithImage} = require("../discord-client");
const createBidAcceptedEmbed = require('../embeds/bid-accepted-embed')
const resourceRewards = require("../mappings/resource-types");
const {getTradeMessages, getAccountByWallet} = require("../evrloot-db");
const {
  getTradeNfts,
  getDiscordUserForWallet,
  getNftWithMetadata,
  getResourcesWithMetadata, getSoulMetadataForTrade
} = require("./trade-helpers");
const fs = require("fs");
const {AttachmentBuilder} = require("discord.js");
const createBidAcceptedSoulTradeEmbed = require("../embeds/accept-bid-on-soul-trade-embed");

module.exports = {
  handleBidAccepted
}

async function handleBidAccepted(tradeId) {
  console.log('handle bid accepted event with', tradeId)
  try {
    await new Promise(resolve => setTimeout(resolve, 10000));
    const tradeInfo = await fetchTradeByIdFromSquid(tradeId)
    if (!tradeInfo) {
      console.log('no trade info found')
      return;
    }

    const textInfo = await getTradeMessages(tradeInfo.id)
    console.log(textInfo)

    const tradeCreator = await getDiscordUserForWallet(tradeInfo.ownerAddress)
    console.log('1')

    if (isSoulTrade(tradeInfo)) {
      console.log('is soul trade true for bid win')
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

      const bidId = tradeInfo.acceptedBid.id
      const bidInfo = await fetchBidByIdFromSquid(bidId)
      const bidCreator = await getDiscordUserForWallet(bidInfo.ownerAddress)

      const bidNfts = await getNftWithMetadata(bidInfo.erc721s, bidInfo.unclaimedNfts)
      const bidResources = await getResourcesWithMetadata(bidInfo.erc1155s, bidInfo.unclaimedResources)

      const newTradeEmbed = createBidAcceptedSoulTradeEmbed(tradeInfo, textInfo, tradeCreator, soul, imageFileName, bidInfo, bidCreator, bidNfts, bidResources)
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
      console.log('2')

      const bidId = tradeInfo.acceptedBid.id
      const bidInfo = await fetchBidByIdFromSquid(bidId)
      console.log('3')
      const bidCreator = await getDiscordUserForWallet(bidInfo.ownerAddress)

      const bidNfts = await getNftWithMetadata(bidInfo.erc721s, bidInfo.unclaimedNfts)
      const bidResources = await getResourcesWithMetadata(bidInfo.erc1155s, bidInfo.unclaimedResources)

      const bidAcceptedEmbed = createBidAcceptedEmbed(tradeInfo, textInfo, tradeCreator, tradeNfts, tradeResources, bidInfo, bidCreator, bidNfts, bidResources)

      await postNewTrade(bidAcceptedEmbed)

    }


  } catch (e) {
    await logMessageOrError('could not send trade accepted event')
    console.error(e)
  }

}

const estraTokenNftAddress = '0xba6bd2aace40c9a14c4123717119a80e9fe6738a' // identify if soul is staked => fetch via estra token
const soulNftAddress = '0x9d1454e198f4b601bfc0069003045b0cbc0e6749'

function isSoulTrade(tradeInfo) {
  console.log('is soul trade on bid win')
  if (tradeInfo.erc1155s.length > 0 || tradeInfo.unclaimedResources.length > 0) return false
  console.log('not 1', tradeInfo.erc721s.length, tradeInfo.unclaimedNfts.length)
  if (tradeInfo.erc721s.length + tradeInfo.unclaimedNfts.length !== 1) return false
  console.log('not 2')
  if (tradeInfo.erc721s[0]) return tradeInfo.erc721s[0].contractAddress.toLowerCase() === estraTokenNftAddress
  console.log('not 3')
  return tradeInfo.unclaimedNfts[0].contractAddress.toLowerCase() === soulNftAddress
}
