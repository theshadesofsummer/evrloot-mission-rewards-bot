const {fetchTradeByIdFromSquid, getFromIpfs, fetchNftMetadataByIdAndCollection} = require("../evrloot-api");
const {postNewTrade} = require("../discord-client");
const createNewTradeEmbed = require('../embeds/new-trade-embed')
const resourceRewards = require("../mappings/resource-types");

module.exports = {
  handleNewTrade
}

async function handleNewTrade(tradeId) {
  console.log('handle new trade event with', tradeId)

  const tradeInfo = await fetchTradeByIdFromSquid(tradeId)
  console.log('tradeInfo', tradeInfo)

  const tradeResources = []
  for (const erc1155 of tradeInfo.erc1155s) {
    const resourceInfo = await enrichErc1155Info(erc1155.tokenId, erc1155.amount)
    tradeResources.push(resourceInfo)
  }
  for (const erc1155 of tradeInfo.unclaimedResources) {
    const resourceInfo = await enrichErc1155Info(erc1155.resourceId, erc1155.amount)
    tradeResources.push(resourceInfo)
  }

  for (const erc721 of tradeInfo.erc721s) {
    const erc721Metadata = await fetchNftMetadataByIdAndCollection(erc721.tokenId, erc721.contractAddress)
    console.log('erc721Metadata', erc721Metadata)
    tradeResources.push(resourceInfo)
  }

  const newTradeEmbed = createNewTradeEmbed(tradeInfo, tradeResources)

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
