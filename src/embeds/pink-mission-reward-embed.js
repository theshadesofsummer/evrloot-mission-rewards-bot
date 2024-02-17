const removeIpfsStuff = require("../helpers/ipfs-link-tools");

module.exports = function createPinkMissionRewardEmbed(reward) {
  return {
    color: 0xff009c,
    author: {
      name: 'New Pink Mission Reward!',
      icon_url: 'https://dotispink.xyz/assets/pink-logo-6091295c.svg',
    },
    description: `${reward.amount} ${reward.retrievedMetadata.name} were fished out of the water!`,
    thumbnail: {
      url: getCorrectImageUrl(reward.retrievedMetadata.mediaUri)
    },
  };
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