const createMissionRewardEmbed = require('./embeds/mission-reward-embed.js')
const { itemIds } = require('./mappings/item-ids.js')
const { MISSION_CONTRACT } = require("./abi-interaction.js");
const resourceRewards = require('./mappings/resource-types.js');
const { getFromIpfs } = require('./evrloot-api.js')
const config = require('./config.js')
const { addToStats, increaseMissionCounter, getStats } = require('./summary/daily-stats.js')
const {getAccountName} = require("./evrloot-db");
const {getAccountFromTx} = require("./abi-interaction");
const {nftMapping} = require("./mappings/item-ids");
const {postEmbed} = require("./discord-client");

module.exports = {
  fetchMissionReward
}

async function fetchMissionReward(eventInput) {
  console.log('[RWD]', 'started fetching mission rewards')
  increaseMissionCounter();

  // currently not in use
  // const missionInformation = await MISSION_CONTRACT.methods.getMissionData(eventInput.returnValues.missionId).call();

  const resourceRewards = eventInput.returnValues.resourceRewards;
  const nftRewards = eventInput.returnValues.nftRewards;

  const rewardsForEmbed = [];

  for (const resourceReward of resourceRewards) {
    const resourceRewardWithMetadata = await getResourceRewardInfos(resourceReward);

    if (resourceRewardWithMetadata !== undefined) {
      if (resourceRewardWithMetadata.retrievedMetadata === undefined) {
        console.warn('[RWD]', 'found no metadata for rr', resourceRewardWithMetadata)
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
        console.warn('[RWD]', 'found no metadata for nr', nftRewardWithMetadata)
        return;
      }
      addToStats(nftRewardWithMetadata)
      rewardsForEmbed.push(nftRewardWithMetadata)
    }

  }

  const filteredNftRewards = rewardsForEmbed.filter(containsShowableRarity);

  if (filteredNftRewards.length <= 0) {
    return;
  }

  const from = await getAccountFromTx(eventInput.transactionHash)

  let accountName = await getAccountName(from)

  for (const filteredNftReward of filteredNftRewards) {
    await postEmbed(createMissionRewardEmbed(accountName, filteredNftReward));
  }
  console.log('[RWD]', 'finished mission rewards')
}

async function getResourceRewardInfos(resourceReward) {
  const amount = Number.parseInt(resourceReward.amount)
  const resourceId = Number.parseInt(resourceReward.resourceId)

  if (amount > 0) {
    const metadataUri = Object.values(resourceRewards).find(rr => rr.id === resourceId).tokenUri;

    const retrievedMetadata = metadataUri
      ? await getFromIpfs(metadataUri)
      : undefined;

    return {
      id: resourceId,
      amount,
      metadata: metadataUri,
      retrievedMetadata: retrievedMetadata,
    };
  }

  return undefined;
}

async function getNftRewardInfos(nftReward) {
  const amount = Number.parseInt(nftReward.amount)

  if (amount > 0) {
    const nftInfo = nftMapping[`${nftReward.contractAddress.toLowerCase()}+${nftReward.itemId}`];

    if (nftInfo === undefined) {
      console.log('no nftMapping found for' + `${nftReward.contractAddress}+${nftReward.itemId}`)
    } else {
      const retrievedMetadata = nftInfo.metadataUri
        ? await getFromIpfs(nftInfo.metadataUri)
        : undefined;

      return {
        id: Number.parseInt(nftReward.itemId),
        amount,
        metadata: nftInfo.metadataUri,
        retrievedMetadata: retrievedMetadata,
      };
    }
  }

  return undefined;
}

function getItemId(poolId, memberId) {
  // Combine poolId and memberId into a single uint
  if (poolId > 255 || memberId > 255) {
    throw new Error('poolId or memberId too large');
  }

  let itemId = BigInt(0);
  itemId = (BigInt(poolId) << BigInt(8)) | BigInt(memberId);
  return itemId;
}

function containsShowableRarity(nftRewardWithMetadata) {
  const rarityMetadata = nftRewardWithMetadata.retrievedMetadata.attributes.find(o => o.label === 'Rarity');
  const rarity = rarityMetadata.value;

  return config.showItems.includes(rarity)
}