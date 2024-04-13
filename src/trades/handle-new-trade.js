const {fetchTradeByIdFromSquid, getFromIpfs} = require("../evrloot-api");
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
    const resourceInfo = await enrichErc1155Info(erc1155)
    tradeResources.push(resourceInfo)
  }

  const newTradeEmbed = createNewTradeEmbed(tradeInfo, tradeResources)

  await postNewTrade(newTradeEmbed)

}


async function enrichErc1155Info(erc1155) {
  const resourceType = Object.values(resourceRewards).find(rr => rr.id === erc1155.tokenId)
  const metadataUri = resourceType.tokenUri;

  const retrievedMetadata = metadataUri
    ? await getFromIpfs(metadataUri)
    : undefined;

  return {
    id: erc1155.tokenId,
    amount: erc1155.amount,
    retrievedMetadata: retrievedMetadata,
    emoteId: resourceType.emoteId
  };
}
