const { getIpfsLinkForItem } = require("./abi-interaction");
const linkWithoutIpfs = require("./ipfs-link-tools")

module.exports = {
  getFromIpfs
}

async function getFromIpfs(ipfsLink) {
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