module.exports = function removeIpfsStuff(ipfsLink) {
  let linkWithoutIpfs = ipfsLink.replace("ipfs://", "");
  if (linkWithoutIpfs.startsWith("ipfs/")) {
    linkWithoutIpfs = linkWithoutIpfs.replace("ipfs/", "");
  }
  return linkWithoutIpfs
}