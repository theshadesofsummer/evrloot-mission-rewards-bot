const removeIpfsStuff = require("./helpers/ipfs-link-tools");
const dns = require("dns");
const fs = require("fs");
const {getSoulIpfsLink} = require("./abi-interaction");

const SQUID_ADDRESS = 'https://squid.subsquid.io/evrsquid/graphql';
const SQUID_MOONBASE_ADDRESS = 'http://api.evrloot.io:4350/graphql';
const QUERY_SOUL_ID_BY_ESTRA_TOKEN_ID = `
query MyQuery($estraTokenId: Int!) {
  nfts(where: {estraTokenId_eq: $estraTokenId}) {
    id
  }
}`
const QUERY_TRADE_BY_ID = `
query MyQuery($tradeId: String!) {
  tradeById(id: $tradeId) {
    id
    active
    block
    buyOutEther
    cancelledBlock
    endTime
    endedBlock
    buyOutErc20 {
      amount
      contractAddress
      id
    }
    ownerAddress
    startTime
    erc721s {
      contractAddress
      id
      tokenId
    }
    erc1155s {
      amount
      contractAddress
      id
      tokenId
    }
    unclaimedResources {
      amount
      id
      resourceId
    }
    unclaimedNfts {
      amount
      contractAddress
      id
      itemId
    }
  }
}
`

module.exports = {
  getSouls,
  getOnlySouls,
  startFight,
  getSoulMetadata,
  mapMetadataToSoul,
  getFromIpfs,
  fetchSoulIdFromSquid,
  fetchTradeByIdFromSquid,
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
  return await fetchAsync(`https://api.evrloot.io/api/combat/fight`, {
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
  const soulMetadataLink = await getSoulIpfsLink(Number.parseInt(soul.id.split('-').reverse()[0]));
  const soulMetadata = await getFromIpfs(soulMetadataLink);
  return {...soul, retrievedMetadata: soulMetadata}
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

async function fetchTradeByIdFromSquid(tradeId) {
  console.log('[API]', 'fetching trade from squid for tradeId', tradeId)
  return fetch(SQUID_MOONBASE_ADDRESS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: QUERY_TRADE_BY_ID,
      variables: {
        tradeId: tradeId,
      },
    }),
  })
    .then((res) => res.json())
    .then((result) => {
      console.log('>> RESULT:', result)
      return result.data.tradeById;
    })
    .catch((err) => {
      console.log('error while fetching from squid:', err);
      return undefined
    });
}