const removeIpfsStuff = require("../helpers/ipfs-link-tools");

module.exports = function createMissionRewardEmbed(soul, reward) {
  if (reward.emoteId === '')
    console.log('[RWD] cannot find emote for', reward.retrievedMetadata.name)

  return {
    color: colorForRarity(reward.retrievedMetadata.attributes.find(m => m.label === 'Rarity')),
    author: {
      name: 'New Mission Reward!',
      icon_url: 'https://game.evrloot.com/assets/icons/moonbeamIcon.png',
    },
    description: `**${soul.retrievedMetadata.name}** found ${reward.amount} ${reward.retrievedMetadata.name}! ${reward.emoteId}`,
    thumbnail: {
      url: getCorrectImageUrl(soul.retrievedMetadata.image)
    },
  };
}

function colorForRarity(rarityMetadata) {
  const rarity = rarityMetadata.value;

  if (rarity === 'Legendary') {
    return 0xF4B01E
  } else if (rarity === 'Epic') {
    return 0xC12FE2
  } else if (rarity === 'Rare') {
    return 0x34E0F5
  } else if (rarity === 'Common') {
    return 0xD2D2D2
  } else {
    return 0xFF0000
  }
}

function getCorrectImageUrl(imageUrl) {
  if (!imageUrl) {
    console.log('UNDEFINED ERROR, IMAGE URL IS UNDEFINED')
    return ''
  }
  if (imageUrl.startsWith('ipfs://')) {
    return `https://evrloot.myfilebase.com/ipfs/${removeIpfsStuff(imageUrl)}`
  } else {
    return imageUrl
  }
}