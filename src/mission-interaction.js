const { postEmbed } = require('./discord-bot.js')
const createMissionRewardEmbed = require('./embeds/mission-reward-embed.js')
const { itemIds } = require('./mappings/fish-types.js')
const { MISSION_CONTRACT } = require("./abi-interaction.js");
const resourceRewards = require('./mappings/resource-types.js');
const { getFromIpfs } = require('./evrloot-ipfs.js')
const config = require('./config.js')
const { addToStats, increaseMissionCounter, getStats } = require('./summary/daily-stats.js')
const {getAccountName} = require("./evrloot-db");

module.exports = {
  fetchMissionReward
}

async function fetchMissionReward(eventInput) {
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
        console.warn('found no metadata for', resourceRewardWithMetadata)
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
        console.warn('found no metadata for', nftRewardWithMetadata)
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

  let accountName = await getAccountName({wallet: eventInput.address})

  if (!accountName) {
    accountName = 'An anonymous traveller '
  }

  for (const filteredNftReward of filteredNftRewards) {
    await postEmbed(createMissionRewardEmbed(accountName, filteredNftReward));
  }
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
  const itemId = Number.parseInt(nftReward.itemId)
  const amount = Number.parseInt(nftReward.amount)

  if (amount > 0) {
    const poolId = itemId >> 8;
    const memberId = itemId & 0xff;
    const contractAddress = nftReward.contractAddress

    const metadataUri = Object.values(itemIds).find((t) =>
      t.poolId == poolId
      && t.memberId == memberId
      && t.contractAddress == contractAddress
    ).tokenUri;

    const retrievedMetadata = metadataUri
      ? await getFromIpfs(metadataUri)
      : undefined;

    return {
      id: itemId,
      amount,
      metadata: metadataUri,
      retrievedMetadata: retrievedMetadata,
    };
  }

  return undefined;
}

function containsShowableRarity(nftRewardWithMetadata) {
  const rarityMetadata = nftRewardWithMetadata.retrievedMetadata.attributes.find(o => o.label === 'Rarity');
  const rarity = rarityMetadata.value;

  return config.showItems.includes(rarity)
}