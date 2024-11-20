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

async function fetchMissionReward(tokenId, nftRewards, resourceRewards) {
  console.log('[RWD]', 'started fetching mission rewards')
  increaseMissionCounter();

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

  const crabRewards = rewardsForEmbed.filter(hasCrabItems)
  for (const pinkNftReward of crabRewards) {
    await postEmbed(createPinkMissionRewardEmbed(pinkNftReward));
  }


  const filteredNftRewards = rewardsForEmbed
    .filter(containsShowableRarity)
    .filter(reward => !hasCrabItems(reward));

  if (filteredNftRewards.length <= 0) {
    return;
  }

  // old location for account fetching

  const estraTokenId = Number.parseInt(tokenId);
  const soulId = await fetchSoulIdFromSquid(estraTokenId);

  if (!soulId) {
    return;
  }
  const soulMetadata = await getSoulMetadata(soulId);

  console.log('[RWD]', 'soul with id', soulId, 'has name', soulMetadata.retrievedMetadata.name)

  for (const filteredNftReward of filteredNftRewards) {
    await postEmbed(createMissionRewardEmbed(soulMetadata, filteredNftReward));
  }
}

async function getResourceRewardInfos(resourceReward) {
  const amount = Number.parseInt(resourceReward.amount)
  const resourceId = Number.parseInt(resourceReward.resourceId)

  if (amount > 0) {
    const resourceType = Object.values(resourceRewards).find(rr => rr.id === resourceId)
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
  const rarityMetadata = nftRewardWithMetadata.retrievedMetadata.attributes.find(o => o.label === 'Rarity');
  const rarity = rarityMetadata.value;

  return config.showItems.includes(rarity)
}

function hasCrabItems(reward) {
  return reward.retrievedMetadata.name.includes('Small Crab') || reward.retrievedMetadata.name.includes('Giant Pink Crab')
}