const {fetchTradeByIdFromSquid, getFromIpfs, fetchNftMetadataByIdAndCollection} = require("../evrloot-api");
const {postNewTrade, getUserByClientId} = require("../discord-client");
const createNewTradeEmbed = require('../embeds/new-trade-embed')
const resourceRewards = require("../mappings/resource-types");
const {getTradeMessages, getAccountByWallet} = require("../evrloot-db");
const {getTradeResources, getNftWithMetadata, getDiscordUserForWallet, getResourcesWithMetadata} = require("./trade-helpers");

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

  const tradeNfts = await getNftWithMetadata(tradeInfo.erc721s, tradeInfo.unclaimedNfts)
  const tradeResources = await getResourcesWithMetadata(tradeInfo.erc1155s, tradeInfo.unclaimedResources)

  const newTradeEmbed = createNewTradeEmbed(tradeInfo, textInfo, tradeCreator, tradeNfts, tradeResources)

  await postNewTrade(newTradeEmbed)

}

