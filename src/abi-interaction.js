const web3 = require("./web3");
const CONTRACT_ADDRESS_EVRLOOT_BOUND = '0x29CCcF21Bc494F3685C057d5B4fBeFf0f0D53C63';
const CONTRACT_ADDRESS_EVRLOOT_RESOURCES = '0x07801e1d8d868b351c83fd10de74aba7c5e989ea';

const ABI_MISSION_CONTRACT = require('./abi/ABI_MISSION_FAUCET.json');
const ABI_EVRLOOT_RESOURCES = require('./abi/ABI_EVRLOOT_RESOURCES.json');
const ABI_EVRLOOT_MARKETPLACE = require('./abi/ABI_EVRLOOT_MARKETPLACE.json');

const ABI_EVRLOOT_SOULS = require('./abi/ABI_EVRLOOT_SOULS.json');
const CONTRACT_ADDRESS_EVRLOOT_SOULS = '0x9D1454e198F4b601BfC0069003045b0CBC0e6749';
const EVRLOOT_SOULS = new web3.eth.Contract(ABI_EVRLOOT_SOULS, CONTRACT_ADDRESS_EVRLOOT_SOULS);

module.exports = {
  MISSION_CONTRACT: new web3.eth.Contract(ABI_MISSION_CONTRACT, CONTRACT_ADDRESS_EVRLOOT_BOUND),
  EVRLOOT_RESOURCES: new web3.eth.Contract(ABI_EVRLOOT_RESOURCES, CONTRACT_ADDRESS_EVRLOOT_BOUND),
  MARKETPLACE_CONTRACT: new web3.eth.Contract(ABI_EVRLOOT_MARKETPLACE, CONTRACT_ADDRESS_EVRLOOT_BOUND),
  getAccountFromTx,
  getSoulIpfsLink
}

async function getAccountFromTx(txhash) {
  const tx = await web3.eth.getTransaction(txhash)
  return tx.from
}

async function getSoulIpfsLink(tokenId) {
  return await EVRLOOT_SOULS.methods.getAssetMetadata(tokenId, tokenId).call();
}

