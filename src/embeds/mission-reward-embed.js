const removeIpfsStuff = require("../ipfs-link-tools");


module.exports = function createMissionRewardEmbed(id) {
  return {
    color: 0x1f8724,
    title: `Mission ${id} ended`,
    //url: `https://singular.app/collectibles/moonbeam/${ITEM_COLLECTION}/${id}`,
    author: {
      name: 'New Mission Reward!',
      //icon_url: 'https://game.evrloot.com/assets/icons/moonbeamIcon.png',
    },
    //description: `Item listed for **${price} ${paymentOption}** (${usdPrice}$)`,
    //thumbnail: {
    //  url: `https://evrloot.mypinata.cloud/ipfs/${removeIpfsStuff(itemMetadata["image"])}`,
    //},
    //fields: [
    //  {
    //    name: 'Attributes',
    //    value: itemAttrFormatter(itemMetadata["attributes"]),
    //    inline: true
    //  },
    //  {
    //    name: 'Stats',
    //    value: itemStatsFormatter(itemMetadata["attributes"]),
    //    inline: true
    //  }
    //],
  };
}
