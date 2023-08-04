const removeIpfsStuff = require("../ipfs-link-tools");

module.exports = function createMissionRewardEmbed(metadata) {
  return {
    color: colorForRarity(metadata.attributes.find(m => m.label === 'Rarity')),
    title: `${metadata.name} found!`,
    author: {
      name: 'New Mission Reward!',
      icon_url: 'https://game.evrloot.com/assets/icons/moonbeamIcon.png',
    },
    thumbnail: {
      url: `https://evrloot.myfilebase.com/ipfs/${removeIpfsStuff(metadata.image)}`,
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