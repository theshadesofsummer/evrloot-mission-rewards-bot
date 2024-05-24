const {fetchTradeByIdFromSquid, getFromIpfs, fetchNftMetadataByIdAndCollection, fetchBidByIdFromSquid} = require("../evrloot-api");
const {postNewTrade, getUserByClientId} = require("../discord-client");
const createNewBidEmbed = require('../embeds/new-bid-embed')
const resourceRewards = require("../mappings/resource-types");
const {getTradeMessages, getAccountByWallet} = require("../evrloot-db");

module.exports = {
  handleNewBid
}

async function handleNewBid(bidId) {
  console.log('handle new bid event with', bidId)

  await new Promise(resolve => setTimeout(resolve, 10000));
  const bidInfo = await fetchBidByIdFromSquid(bidId)
  console.log('>>>>>> bidInfo', bidInfo)
  if (!bidInfo) {
    console.error('no bid found for', bidId)
    return;
  }
  const textInfo = await getTradeMessages(bidInfo.trade.id)
  console.log(textInfo)
  if (!textInfo) {
    console.error('no textInfo found for trade on bid', bidId)
    return;
  }

  let tradeCreator = undefined
  let bidCreator = undefined
  const tradingUser = await getAccountByWallet(bidInfo.trade.ownerAddress.toLowerCase())
  const biddingUser = await getAccountByWallet(bidInfo.ownerAddress.toLowerCase())
  if (tradingUser) {
    tradeCreator = await getUserByClientId(tradingUser.discordId)
  }
  if (biddingUser) {
    bidCreator = await getUserByClientId(biddingUser.discordId)
  }

  const tradeNfts = []
  for (const erc721 of bidInfo.erc721s) {
    const erc721MetadataLink = await fetchNftMetadataByIdAndCollection(erc721.tokenId, erc721.contractAddress.toLowerCase())
    const erc721Metadata = await getFromIpfs(erc721MetadataLink)
    tradeNfts.push(erc721Metadata)
  }

  const tradeResources = []
  for (const erc1155 of bidInfo.erc1155s) {
    const resourceInfo = await enrichErc1155Info(erc1155.tokenId, erc1155.amount)
    tradeResources.push(resourceInfo)
  }
  for (const erc1155 of bidInfo.unclaimedResources) {
    const resourceInfo = await enrichErc1155Info(erc1155.resourceId, erc1155.amount)
    tradeResources.push(resourceInfo)
  }

  const newTradeEmbed = createNewBidEmbed(bidInfo, textInfo, tradeCreator, bidCreator, tradeNfts, tradeResources)

  await postNewTrade(newTradeEmbed)

}

async function enrichErc1155Info(erc1155Id, erc1155Amount) {
  const resourceType = Object.values(resourceRewards).find(rr => rr.id === erc1155Id)
  const metadataUri = resourceType.tokenUri;

  const retrievedMetadata = metadataUri
    ? await getFromIpfs(metadataUri)
    : undefined;

  return {
    id: erc1155Id,
    amount: erc1155Amount,
    retrievedMetadata: retrievedMetadata,
    emoteId: resourceType.emoteId
  };
}
