const {ethers} = require("ethers");
const provider = require("./provider")

const CONTRACT_ADDRESS_EVRLOOT_BOUND = '0xba6bd2Aace40c9a14c4123717119a80e9fe6738A';
const CONTRACT_ADDRESS_MARKET_DIAMOND = '0x3e2eA77C52b1D9Be5AA9dD019e2403473b20fcE4';
const CONTRACT_ADDRESS_EVRLOOT_SOULS = '0x9D1454e198F4b601BfC0069003045b0CBC0e6749';
const CONTRACT_ADDRESS_EVRLOOT_RESOURCES = '0x07801e1d8d868b351c83fd10de74aba7c5e989ea';

const ABI_MISSION_CONTRACT = require('./abi/ABI_MISSION_FAUCET.json');
const ABI_EVRLOOT_RESOURCES = require('./abi/ABI_EVRLOOT_RESOURCES.json');
const ABI_EVRLOOT_MARKETPLACE = require('./abi/ABI_EVRLOOT_MARKETPLACE.json');
const ABI_EXPEDITION_FAUCET = require('./abi/ABI_EXPEDITION_FAUCET.json');
const ABI_EVRLOOT_SOULS = require('./abi/ABI_EVRLOOT_SOULS.json');

const EVRLOOT_SOULS = new ethers.Contract(CONTRACT_ADDRESS_EVRLOOT_SOULS, ABI_EVRLOOT_SOULS, provider);

module.exports = {
  MISSION_CONTRACT: new ethers.Contract(CONTRACT_ADDRESS_EVRLOOT_BOUND, ABI_MISSION_CONTRACT, provider),
  EVRLOOT_RESOURCES: new ethers.Contract(CONTRACT_ADDRESS_EVRLOOT_BOUND, ABI_EVRLOOT_RESOURCES, provider),
  MARKETPLACE_CONTRACT: new ethers.Contract(CONTRACT_ADDRESS_MARKET_DIAMOND, ABI_EVRLOOT_MARKETPLACE, provider),
  EXPEDITION_CONTRACT: new ethers.Contract(CONTRACT_ADDRESS_EVRLOOT_BOUND, ABI_EXPEDITION_FAUCET, provider),
  getAccountFromTx,
  getSoulIpfsLink
}

async function getAccountFromTx(txhash, provider) {
  const tx = await provider.getTransaction(txhash);
  return tx.from;
}

async function getSoulIpfsLink(tokenId) {
  return await EVRLOOT_SOULS.getAssetMetadata(tokenId, tokenId);
}
