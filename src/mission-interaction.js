const { postEmbed } = require('./discord-bot.js')
const createMissionRewardEmbed = require('./embeds/mission-reward-embed.js')
const { itemIds } = require('./mappings/fish-types.js')
const { MISSION_CONTRACT } = require("./abi-interaction.js");
const resourceRewards = require('./mappings/resource-types.js');
const { getFromIpfs } = require('./evrloot-ipfs.js')
const config = require('./config.js')
const { addToStats, increaseMissionCounter, getStats } = require('./summary/daily-stats.js')

module.exports = {
  fetchMissionReward
}

async function fetchMissionReward(eventInput) {
  increaseMissionCounter();

  console.log('mission counter with this:', getStats().missionCounter)

  // currently not in use
  // const missionInformation = await MISSION_CONTRACT.methods.getMissionData(eventInput.returnValues.missionId).call();

  const resourceRewards = eventInput.returnValues.resourceRewards;
  const nftRewards = eventInput.returnValues.nftRewards;
  console.log('total size of nft rewards:', nftRewards.length);

  for (const resourceReward of resourceRewards) {
    const resourceRewardWithMetadata = await getResourceRewardInfos(resourceReward);
    if (resourceRewardWithMetadata === undefined) {
      return;
    }

    addToStats(resourceRewardWithMetadata)
  }


  const nftRewardsForEmbed = [];
  for (const nftReward of nftRewards) {
    const amount = Number.parseInt(nftReward.amount)
    console.log('amount of nftReward', amount, typeof amount);
    if (amount <= 0) {
      return;
    }

    const nftRewardWithMetadata = await getNftRewardInfos(nftReward);

    console.log('found', amount, nftRewardWithMetadata.retrievedMetadata.name);

    addToStats(nftRewardWithMetadata)

    nftRewardsForEmbed.push(nftRewardWithMetadata);
  }

  const filteredNftRewards = nftRewardsForEmbed.filter(containsShowableRarity);
  for (const filteredNftReward of filteredNftRewards) {
    await postEmbed(createMissionRewardEmbed(filteredNftReward.retrievedMetadata));
  }
}

async function getResourceRewardInfos(resourceReward) {
  const amount = Number.parseInt(resourceReward.amount)
  const resourceId = Number.parseInt(resourceReward.resourceId)

  if (amount <= 0) {
    return;
  }

  const metadataUri = Object.values(resourceRewards).find(rr => rr.id === resourceId).tokenUri;

  const retrievedMetadata = metadataUri
    ? await getFromIpfs(metadataUri)
    : undefined;

  return {
    resourceId,
    amount,
    metadata: metadataUri,
    retrievedMetadata: retrievedMetadata,
  };

}

async function getNftRewardInfos(nftReward) {
  const amount = Number.parseInt(nftReward.amount)

  const itemId = nftReward.itemId;
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
    itemId,
    amount,
    metadata: metadataUri,
    retrievedMetadata: retrievedMetadata,
  };
}

function containsShowableRarity(nftRewardWithMetadata) {
  const rarityMetadata = nftRewardWithMetadata.retrievedMetadata.attributes.find(o => o.label === 'Rarity');
  const rarity = rarityMetadata.value;

  console.log('rarity', rarity)

  return config.showItems.includes(rarity)
}