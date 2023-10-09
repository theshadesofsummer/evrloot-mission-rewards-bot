const createMissionRewardEmbed = require('./embeds/mission-reward-embed.js')
const { itemIds } = require('./mappings/item-ids.js')
const { MISSION_CONTRACT } = require("./abi-interaction.js");
const resourceRewards = require('./mappings/resource-types.js');
const { getFromIpfs } = require('./evrloot-api.js')
const config = require('./config.js')
const { addToStats, increaseMissionCounter, getStats } = require('./summary/daily-stats.js')
const {getAccountByWallet} = require("./evrloot-db");
const {getAccountFromTx} = require("./abi-interaction");
const {nftMapping} = require("./mappings/item-ids");
const {postEmbed} = require("./discord-client");
const {getSoulMetadata} = require("./evrloot-api");

const EVRSOULS_PREFIX = 'EVR-SOULS-';

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

  const tokenId = EVRSOULS_PREFIX + eventInput.returnValues.tokenId;
  const soulMetadata = await getSoulMetadata(tokenId)

  console.log('[RWD]', 'soul with id', tokenId, 'has name', soulMetadata.retrievedMetadata.name)

  const from = await getAccountFromTx(eventInput.transactionHash)
  let accountEntry = await getAccountByWallet(from.toLowerCase())

  for (const filteredNftReward of filteredNftRewards) {
    await postEmbed(createMissionRewardEmbed(soulMetadata, accountEntry, filteredNftReward));
  }
  console.log('[RWD]', 'finished mission rewards')
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
      emoteId: resourceType.emoteId
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