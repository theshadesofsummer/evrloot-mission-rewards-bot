const { getIpfsLinkForItem } = require("./abi-interaction");
const linkWithoutIpfs = require("./ipfs-link-tools")

module.exports = {
  getItemMetadata,
  getSoulMetadata,
  getFishMetadata
}

async function getItemMetadata(tokenId) {
  let ipfsLink = await getIpfsLinkForItem(tokenId);
  if (ipfsLink === undefined) {
    throw Error(`No IPFS Link for Item ${tokenId} found`);
  }
  return await fetchAsync(`https://evrloot.mypinata.cloud/ipfs/${linkWithoutIpfs(ipfsLink)}`);
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