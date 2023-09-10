const linkWithoutIpfs = require("./helpers/ipfs-link-tools");
const dns = require("dns");

module.exports = {
  getSouls,
  getOnlySouls,
  startFight,
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

async function startFight(attackers, defenders) {
  return await fetchAsync(`https://api.evrloot.xyz/api/combat/fight`, {
    method: 'POST',
    body: JSON.stringify({
      attackers,
      defenders,
      password: process.env.API_PASSWORD
    }),
    headers: { 'Content-Type': 'application/json' }
  });
}

async function getFromIpfs(ipfsLink) {
  return await fetchAsync(`https://evrloot.myfilebase.com/ipfs/${linkWithoutIpfs(ipfsLink)}`);
}

async function fetchAsync(url, options = {}) {
  console.log('[API]', 'fetching from url', url)
  dns.setDefaultResultOrder('ipv4first')
  return fetch(url, options).then(response => {
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`)
    }
    return response.json()
  }).then(json => {
    return json
  }).catch(error => console.log(error))
}