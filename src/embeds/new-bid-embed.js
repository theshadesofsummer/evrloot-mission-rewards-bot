const {getFields, getAuthor} = require("../trades/embed-helpers");
module.exports = function createNewBidEmbed(bidInfo, textInfo, tradeCreator, bidCreator, bidNfts, bidResources) {
  const fields = getFields(bidInfo, bidNfts, bidResources, false);

  const author = getAuthor(bidCreator)

  const tradeCreatorInfo = tradeCreator ? `on ${tradeCreator.globalName}'s trade` : ''

  return {
    color: 0xf16a06,
    title: `New Bid: ${textInfo
      ? textInfo.title
      : 'trade without title'
    } ${tradeCreatorInfo}`,
    url: `https://game.evrloot.com/marketplace?mId=${bidInfo.trade.id}`,
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
