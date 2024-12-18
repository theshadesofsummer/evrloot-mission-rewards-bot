const {getFields, getAuthor} = require("../trades/embed-helpers");

module.exports = function createNewTradeEmbed(tradeInfo, textInfo, tradeCreator, tradeNfts, tradeResources) {
  const fields = getFields(tradeInfo, tradeNfts, tradeResources, true)

  const author = getAuthor(tradeCreator)

  return {
    color: 0x5308a8,
    title: `New Trade: ${textInfo
      ? textInfo.title  
      : 'no title'}`,
    url: `https://game.evrloot.com/marketplace?mId=${tradeInfo.id}`,
    author,
    // thumbnail: {
    //   url: soul.retrievedMetadata.image
    // },
    description: textInfo
      ? textInfo.message
      : 'no message',
    fields,
    timestamp: new Date().toISOString(),
  };
}

