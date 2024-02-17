const removeIpfsStuff = require("../helpers/ipfs-link-tools");

module.exports = function createPinkMissionRewardEmbed(reward) {
  return {
    color: 0xff009c,
    author: {
      name: 'New Pink Mission Reward!',
      icon_url: 'https://pbs.twimg.com/profile_images/1726609813444976640/FUtE2nBJ_400x400.jpg',
    },
    description: `${reward.amount} ${reward.pinkExclusiveName} fished out of the water!`,
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