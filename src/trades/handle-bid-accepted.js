const {
  fetchTradeByIdFromSquid,
  getFromIpfs,
  fetchNftMetadataByIdAndCollection,
  fetchBidByIdFromSquid
} = require("../evrloot-api");
const {postNewTrade, getUserByClientId, logMessageOrError} = require("../discord-client");
const createBidAcceptedEmbed = require('../embeds/bid-accepted-embed')
const resourceRewards = require("../mappings/resource-types");
const {getTradeMessages, getAccountByWallet} = require("../evrloot-db");
const {
  getTradeNfts,
  getDiscordUserForWallet,
  getNftWithMetadata,
  getResourcesWithMetadata
} = require("./trade-helpers");

module.exports = {
  handleBidAccepted
}

async function handleBidAccepted(tradeId) {
  console.log('handle bid accepted event with', tradeId)
  try {
    await new Promise(resolve => setTimeout(resolve, 10000));
    const tradeInfo = await fetchTradeByIdFromSquid(tradeId)
    console.log('no trade info found')
    if (!tradeInfo) {
      return;
    }

    const textInfo = await getTradeMessages(tradeInfo.id)
    console.log(textInfo)

    const tradeCreator = await getDiscordUserForWallet(tradeInfo.ownerAddress)
    console.log('1')

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
  } catch (e) {
    await logMessageOrError('could not send trade accepted event')
    console.error(e)
  }

}
