const {fetchNftMetadataByIdAndCollection, getFromIpfs} = require("../evrloot-api");
const resourceRewards = require("../mappings/resource-types");
const {getAccountByWallet} = require("../evrloot-db");
const {getUserByClientId} = require("../discord-client");

const GLMR_DECIMALS = Math.pow(10, 18);
const TOKEN_INFOS = new Map([
  ['0xfFfFFfFf30478fAFBE935e466da114E14fB3563d', {
    ticker: 'PINK',
    decimals: Math.pow(10, 10)
  }]
])

module.exports = {
  GLMR_DECIMALS,
  TOKEN_INFOS,
  getNftWithMetadata,
  getResourcesWithMetadata,
  getDiscordUserForWallet
}

async function getNftWithMetadata(erc721s, unclaimedNfts) {
  const tradeNfts = []
  for (const erc721 of erc721s) {
    const erc721MetadataLink = await fetchNftMetadataByIdAndCollection(erc721.tokenId, erc721.contractAddress.toLowerCase())
    const erc721Metadata = await getFromIpfs(erc721MetadataLink)
    tradeNfts.push(erc721Metadata)
  }
  for (const erc721 of unclaimedNfts) {
    console.log("DEBUG: fetch unclaimedNfts metadata incoming")
    const erc721MetadataLink = await fetchNftMetadataByIdAndCollection(erc721.itemId, erc721.contractAddress.toLowerCase())
    console.log("DEBUG: fetched link", erc721MetadataLink)
    const erc721Metadata = await getFromIpfs(erc721MetadataLink)
    console.log("DEBUG: fetched metadata", erc721Metadata)
    tradeNfts.push(erc721Metadata)
  }
  return tradeNfts
}

async function getResourcesWithMetadata(erc1155s, unclaimedResources) {
  const tradeResources = []
  for (const erc1155 of erc1155s) {
    const resourceInfo = await enrichErc1155Info(erc1155.tokenId, erc1155.amount)
    tradeResources.push(resourceInfo)
  }
  for (const erc1155 of unclaimedResources) {
    const resourceInfo = await enrichErc1155Info(erc1155.resourceId, erc1155.amount)
    tradeResources.push(resourceInfo)
  }
  return tradeResources
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

async function getDiscordUserForWallet(wallet) {
  const savedUser = await getAccountByWallet(wallet.toLowerCase())
  return savedUser ? await getUserByClientId(savedUser.discordId) : undefined
}