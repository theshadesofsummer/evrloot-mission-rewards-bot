const removeIpfsStuff = require("./helpers/ipfs-link-tools");
const dns = require("dns");
const fs = require("fs");
const {getSoulIpfsLink} = require("./abi-interaction");

const SQUID_ADDRESS = 'https://squid.subsquid.io/evrsquid/graphql';
const QUERY_SOUL_ID_BY_ESTRA_TOKEN_ID = `
query MyQuery($estraTokenId: Int!) {
  nfts(where: {estraTokenId_eq: $estraTokenId}) {
    id
  }
}`

module.exports = {
  getSouls,
  getOnlySouls,
  startFight,
  getSoulMetadata,
  mapMetadataToSoul,
  getFromIpfs,
  fetchSoulIdFromSquid,
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

async function getSoulMetadata(soulId) {
  const soul = await fetchAsync(`https://api.evrloot.xyz/api/evmnfts/${soulId}`);
  return await mapMetadataToSoul(soul);
}

async function mapMetadataToSoul(soul) {
  const soulMetadataLink = await getSoulIpfsLink(soul.id);
  const soulMetadata = await getFromIpfs(soulMetadataLink);
  const x = {...soul, retrievedMetadata: soulMetadata};
  console.log("found metadata: ", x)
  return x
}

async function getFromIpfs(ipfsLink) {
  return await fetchAsync(`https://evrloot.myfilebase.com/ipfs/${removeIpfsStuff(ipfsLink)}`);
}

async function fetchAsync(url, options = {}) {
  console.log('[API]', 'fetching from url', url)
  dns.setDefaultResultOrder('ipv4first')
  return fetch(url, options).then(response => {
    if (!response.ok) {
      throw new Error(`Request on ${url} failed with status ${response.status}`)
    }
    return response.json()
  }).then(json => {
    return json
  }).catch(error => console.log(error))
}

async function fetchSoulIdFromSquid(estraTokenId) {
  console.log('[API]', 'fetching soulId from squid for estraTokenId', estraTokenId)
  return fetch(SQUID_ADDRESS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: QUERY_SOUL_ID_BY_ESTRA_TOKEN_ID,
      variables: {
        estraTokenId: estraTokenId,
      },
    }),
  })
    .then((res) => res.json())
    .then((result) => {
      return result.data.nfts[0].id;
    })
    .catch((err) => {
      console.log('error while fetching from squid:', err);
      return undefined
    });
}
