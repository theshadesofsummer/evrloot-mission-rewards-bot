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

const QUERY_BID_BY_ID = `
query MyQuery($bidId: String!) {
  bidById(id: $bidId) {
    id
    endTime
    offeredEther
    offeredErc20 {
      amount
      contractAddress
      id
    }
    ownerAddress
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
    trade {
      id
      ownerAddress
    }
  }
}
`

const QUERY_NFT_METADATA_BY_ID_AND_COLLECTION = `
query MyQuery($tokenId: Int!, $collectionAddress: String!) {
  nfts(where: {tokenId_eq: $tokenId, collection: {address_eq: $collectionAddress}}) {
    assets {
      asset {
        metadata
      }
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
  fetchBidByIdFromSquid,
  fetchNftMetadataByIdAndCollection
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
  return fetch(SQUID_ADDRESS, {
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
      return result.data.tradeById;
    })
    .catch((err) => {
      console.log('error while fetching from squid:', err);
      return undefined
    });
}

async function fetchBidByIdFromSquid(bidId) {
  console.log('[API]', 'fetching bid from squid for bidId', bidId)
  return fetch(SQUID_ADDRESS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: QUERY_BID_BY_ID,
      variables: {
        bidId: bidId,
      },
    }),
  })
    .then((res) => res.json())
    .then((result) => {
      return result.data.bidById;
    })
    .catch((err) => {
      console.log('error while fetching from squid:', err);
      return undefined
    });
}

async function fetchNftMetadataByIdAndCollection(tokenId, collectionAddress) {
  console.log('[API]', 'fetching nft metadata from squid for tokenId', tokenId, 'collection', collectionAddress)
  return fetch(SQUID_ADDRESS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: QUERY_NFT_METADATA_BY_ID_AND_COLLECTION,
      variables: {
        tokenId,
        collectionAddress
      },
    }),
  })
    .then((res) => res.json())
    .then((result) => {
      return result.data.nfts[0].assets[0].asset.metadata;
    })
    .catch((err) => {
      console.log('error while fetching from squid:', err);
      return undefined
    });
}
