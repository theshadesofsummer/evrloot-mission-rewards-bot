const createMissionRewardEmbed = require('./embeds/mission-reward-embed.js')
const resourceRewards = require('./mappings/resource-types.js');
const {getFromIpfs} = require('./evrloot-api.js')
const config = require('./config.js')
const {addToStats, increaseMissionCounter} = require('./summary/daily-stats.js')
const {nftMapping} = require("./mappings/item-ids");
const {postEmbed, logMessageOrError} = require("./discord-client");
const {getSoulMetadata, fetchSoulIdFromSquid} = require("./evrloot-api");

module.exports = {
  fetchMissionReward
}

async function fetchMissionReward(eventInput) {
  console.log('[RWD]', 'started fetching mission rewards')
  console.log('[RWD]', 'event data:', JSON.stringify({
    tokenId: eventInput.returnValues.tokenId,
    missionId: eventInput.returnValues.missionId,
    resourceRewardsCount: eventInput.returnValues.resourceRewards?.length || 0,
    nftRewardsCount: eventInput.returnValues.nftRewards?.length || 0
  }))
  increaseMissionCounter();

  const resourceRewards = eventInput.returnValues.resourceRewards;
  const nftRewards = eventInput.returnValues.nftRewards;

  // commented out while waiting for id stuff to be sorted out
  // const tokenId = EVRSOULS_PREFIX + eventInput.returnValues.tokenId;
  // const soulMetadata = await getSoulMetadata(tokenId)
  //
  // error prone
  // fetchAsync(soulMetadata.retrievedMetadata.image)

  // currently not in use
  // const missionInformation = await MISSION_CONTRACT.methods.getMissionData(eventInput.returnValues.missionId).call();

  const rewardsForEmbed = [];

  for (const resourceReward of resourceRewards) {
    const resourceRewardWithMetadata = await getResourceRewardInfos(resourceReward);

    if (resourceRewardWithMetadata !== undefined) {
      if (resourceRewardWithMetadata.retrievedMetadata === undefined) {
        logMessageOrError('no metadata for resourcereward', resourceRewardWithMetadata)
        return;
      }
      addToStats(resourceRewardWithMetadata)
      rewardsForEmbed.push(resourceRewardWithMetadata)
    }
  }

  for (const nftReward of nftRewards) {
    const nftRewardWithMetadata = await getNftRewardInfos(nftReward);

    if (nftRewardWithMetadata !== undefined) {
      if (nftRewardWithMetadata.retrievedMetadata === undefined) {
        logMessageOrError('no metadata for nftreward', nftRewardWithMetadata)
        return;
      }
      addToStats(nftRewardWithMetadata)
      rewardsForEmbed.push(nftRewardWithMetadata)
    }

  }

  // const from = await getAccountFromTx(eventInput.transactionHash)
  // let accountEntry = await getAccountByWallet(from.toLowerCase())


  console.log('[RWD]', 'total rewards collected:', rewardsForEmbed.length)
  
  const filteredNftRewards = rewardsForEmbed
    .filter(containsShowableRarity)

  console.log('[RWD]', 'rewards after rarity filter (Epic/Legendary):', filteredNftRewards.length)
  if (filteredNftRewards.length <= 0) {
    console.log('[RWD]', 'no Epic/Legendary rewards found, skipping post')
    return;
  }

  // old location for account fetching

  const estraTokenId = Number.parseInt(eventInput.returnValues.tokenId);
  console.log('[RWD]', 'fetching soul ID for token:', estraTokenId)
  const soulId = await fetchSoulIdFromSquid(estraTokenId);

  if (!soulId) {
    console.log('[RWD]', 'ERROR: could not fetch soulId from squid for token', estraTokenId)
    await logMessageOrError('[RWD] ERROR: could not fetch soulId from squid for token', estraTokenId)
    return;
  }
  console.log('[RWD]', 'found soulId:', soulId)
  const soulMetadata = await getSoulMetadata(soulId);

  console.log('[RWD]', 'soul with id', soulId, 'has name', soulMetadata.retrievedMetadata.name)

  for (const filteredNftReward of filteredNftRewards) {
    console.log('[RWD]', 'posting embed for reward:', filteredNftReward.retrievedMetadata.name, 'amount:', filteredNftReward.amount)
    try {
      await postEmbed(createMissionRewardEmbed(soulMetadata, filteredNftReward));
      console.log('[RWD]', 'successfully posted embed')
    } catch (error) {
      console.error('[RWD]', 'ERROR posting embed:', error)
      await logMessageOrError('[RWD] ERROR posting embed:', error.message, error.stack)
    }
  }
}

async function getResourceRewardInfos(resourceReward) {
  const amount = Number.parseInt(resourceReward.amount)
  const resourceId = Number.parseInt(resourceReward.resourceId)

  if (amount > 0) {
    const resourceType = Object.values(resourceRewards).find(rr => rr.id === resourceId)
    if (!resourceType) {
      console.log('[RWD]', 'WARNING: no resourceType found for resourceId:', resourceId)
      return undefined;
    }
    const metadataUri = resourceType.tokenUri;

    const retrievedMetadata = metadataUri
      ? await getFromIpfs(metadataUri)
      : undefined;

    return {
      id: resourceId,
      amount,
      metadata: metadataUri,
      retrievedMetadata: retrievedMetadata,
      emoteId: resourceType.emoteId,
      pinkExclusiveName: resourceType.name,
    };
  }

  return undefined;
}

async function getNftRewardInfos(nftReward) {
  const amount = Number.parseInt(nftReward.amount)

  if (amount > 0) {
    const nftInfo = nftMapping[`${nftReward.contractAddress.toLowerCase()}+${nftReward.itemId}`];

    if (nftInfo === undefined) {
      await logMessageOrError('no nftMapping found for', nftReward.contractAddress, nftReward.itemId)
    } else {
      const retrievedMetadata = nftInfo.metadataUri
        ? await getFromIpfs(nftInfo.metadataUri)
        : undefined;

      return {
        id: Number.parseInt(nftReward.itemId),
        amount,
        metadata: nftInfo.metadataUri,
        retrievedMetadata: retrievedMetadata,
        emoteId: nftInfo.emoteId
      };
    }
  }

  return undefined;
}

function containsShowableRarity(nftRewardWithMetadata) {
  try {
    const rarityMetadata = nftRewardWithMetadata.retrievedMetadata.attributes.find(o => o.label === 'Rarity');
    if (!rarityMetadata) {
      console.log('[RWD]', 'no rarity metadata found for reward:', nftRewardWithMetadata.retrievedMetadata.name)
      return false;
    }
    const rarity = rarityMetadata.value;
    const isShowable = config.showItems.includes(rarity)
    if (!isShowable) {
      console.log('[RWD]', 'reward filtered out - rarity:', rarity, 'not in showItems:', config.showItems, 'reward:', nftRewardWithMetadata.retrievedMetadata.name)
    }
    return isShowable
  } catch (error) {
    console.error('[RWD]', 'error in containsShowableRarity:', error)
    logMessageOrError('still issue in containsShowableRarity', nftRewardWithMetadata.retrievedMetadata?.attributes?.toString() || 'no attributes')
    return false
  }

}
