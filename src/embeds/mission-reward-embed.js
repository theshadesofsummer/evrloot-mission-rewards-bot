const removeIpfsStuff = require("../helpers/ipfs-link-tools");

module.exports = function createMissionRewardEmbed(soul, account, reward) {
  if (reward.emoteId === '')
    console.log('[RWD] cannot find emote for', reward.retrievedMetadata.name)

  return {
    color: colorForRarity(reward.retrievedMetadata.attributes.find(m => m.label === 'Rarity')),
    author: {
      name: 'New Mission Reward!',
      icon_url: 'https://game.evrloot.com/assets/icons/moonbeamIcon.png',
    },
    description: `${getAccountName(account)}**${soul.retrievedMetadata.name}** found ${reward.amount} ${reward.retrievedMetadata.name}! ${reward.emoteId}`,
    thumbnail: {
      url: soul.retrievedMetadata.image
    },
  };
}

function getAccountName(account) {
  let accountInfo = '';
  if (account)
    accountInfo += `<@${account.discordId}>'s soul `
  return accountInfo
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