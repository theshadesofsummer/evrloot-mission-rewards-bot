const {
  fetchTradeByIdFromSquid,
  getFromIpfs,
  fetchNftMetadataByIdAndCollection,
  fetchBidByIdFromSquid
} = require("../evrloot-api");
const {postNewTrade, getUserByClientId, logMessageOrError} = require("../discord-client");
const createNewBidEmbed = require('../embeds/new-bid-embed')
const resourceRewards = require("../mappings/resource-types");
const {getTradeMessages, getAccountByWallet} = require("../evrloot-db");
const {getDiscordUserForWallet, getNftWithMetadata, getResourcesWithMetadata} = require("./trade-helpers");

module.exports = {
  handleNewBid
}

async function handleNewBid(bidId) {
  console.log('handle new bid event with', bidId)

  await new Promise(resolve => setTimeout(resolve, 10000));
  const bidInfo = await fetchBidByIdFromSquid(bidId)

  if (!bidInfo) {
    await logMessageOrError('no bid found for', bidId)
    return;
  }
  const textInfo = await getTradeMessages(bidInfo.trade.id)
  if (!textInfo) {
    await logMessageOrError('no textInfo found for trade on bid', bidId)
    return;
  }

  const tradeCreator = await getDiscordUserForWallet(bidInfo.trade.ownerAddress)
  const bidCreator = await getDiscordUserForWallet(bidInfo.ownerAddress)

  const tradeNfts = await getNftWithMetadata(bidInfo.erc721s, bidInfo.unclaimedNfts)
  const tradeResources = await getResourcesWithMetadata(bidInfo.erc1155s, bidInfo.unclaimedResources)

  const newTradeEmbed = createNewBidEmbed(bidInfo, textInfo, tradeCreator, bidCreator, tradeNfts, tradeResources)

  await postNewTrade(newTradeEmbed)

}
