const { postEmbed } = require('./discord-bot.js')
const createMissionRewardEmbed = require('./embeds/mission-reward-embed.js')
const { itemIds } = require('./mappings/fish-types.js')
const { MISSION_CONTRACT } = require("./abi-interaction.js");
const { getFromIpfs } = require('./evrloot-ipfs.js')
const config = require('./config.js')

module.exports = {
  fetchMissionReward
}

async function fetchMissionReward(eventInput) {
  const missionInformation = await MISSION_CONTRACT.methods.getMissionData(eventInput.returnValues.missionId).call();

  const resourceRewards = eventInput.returnValues.resourceRewards;
  const nftRewards = eventInput.returnValues.nftRewards;

  const nftRewardsForEmbed = [];
  for (const nftReward of nftRewards) {
    let nftRewardWithMetadata = await getNftRewardInfos(nftReward);
    nftRewardsForEmbed.push(nftRewardWithMetadata);
  }

  const filteredNftRewards = nftRewardsForEmbed.filter(containsShowableRarity);
  for (const filteredNftReward of filteredNftRewards) {
    await postEmbed(createMissionRewardEmbed(filteredNftReward.retrievedMetadata));
  }
}

async function getNftRewardInfos(nftReward) {
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
    amount: nftReward.amount,
    metadata: metadataUri,
    retrievedMetadata: retrievedMetadata,
  };
}

function containsShowableRarity(nftRewardWithMetadata) {
  const rarityMetadata = nftRewardWithMetadata.retrievedMetadata.attributes.find(o => o.label === 'Rarity');
  const rarity = rarityMetadata.value;

  return config.showItems.includes(rarity)
}