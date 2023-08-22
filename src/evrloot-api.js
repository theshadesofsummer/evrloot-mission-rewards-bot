const linkWithoutIpfs = require("./ipfs-link-tools");
const dns = require("dns");

module.exports = {
  getSouls,
  getOnlySouls,
  getFromIpfs,
}

// could maybe be deprecated for getOnlySouls for speed/wide-band reasons?
async function getSouls(address) {
  const walletInfo = await fetchAsync(`https://api.evrloot.xyz/api/evmnfts/evmwallet/${address}`);
  return walletInfo.evmSouls;
}

async function getOnlySouls(address) {
  return await fetchAsync(`https://api.evrloot.xyz/api/evmnfts/evmwallet/soulsOnly/${address}`);
}

async function getFromIpfs(ipfsLink) {
  return await fetchAsync(`https://evrloot.myfilebase.com/ipfs/${linkWithoutIpfs(ipfsLink)}`);
}

async function fetchAsync(url) {
  dns.setDefaultResultOrder('ipv4first')
  return fetch(url).then(response => {
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`)
    }
    return response.json()
  }).then(json => {
    return json
  }).catch(error => console.log(error))
}