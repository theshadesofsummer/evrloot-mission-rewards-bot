const linkWithoutIpfs = require("./ipfs-link-tools")

module.exports = {
  getFromIpfs,
  getSouls
}

async function getSouls(address) {
  console.log(`https://api.evrloot.xyz/api/evmnfts/evmwallet/${address}`)
  const walletInfo = await fetchAsync(`https://api.evrloot.xyz/api/evmnfts/evmwallet/${address}`);
  console.log(walletInfo)
  return walletInfo.evmSouls;
}

async function getFromIpfs(ipfsLink) {
  return await fetchAsync(`https://evrloot.myfilebase.com/ipfs/${linkWithoutIpfs(ipfsLink)}`);
}

async function fetchAsync(url) {
  return fetch(url).then(response => {
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`)
    }
    return response.json()
  }).then(json => {
    return json
  }).catch(error => console.log(error))
}