const {findValueForAttribute} = require("../helpers/attribute-finder");
const {GLMR_DECIMALS, TOKEN_INFOS} = require("../trades/trade-helpers");
const {getFields} = require("../trades/embed-helpers");

module.exports = function createBidAcceptedEmbed(tradeInfo, textInfo, tradeCreator, tradeNfts, tradeResources, bidInfo, bidCreator, bidNfts, bidResources) {
  const tradeFields = getFields(tradeInfo, tradeNfts, tradeResources, true)
  const bidFields = getFields(bidInfo, bidNfts, bidResources, false)

  const fields = [...tradeFields, ...bidFields]

  const author = tradeCreator(tradeCreator)

  const titlePrefix = `${bidCreator ? `${bidCreator.globalName}'s ` : ''}`
  const title = `${titlePrefix}Bid Accepted: ${textInfo.title}`

  return {
    color: 0x2f9f00,
    title: title,
    url: `https://game.evrloot.com/marketplace?mId=${tradeInfo.id}`,
    author,
    // thumbnail: {
    //   url: soul.retrievedMetadata.image
    // },
    description: textInfo.message,
    fields,
    timestamp: new Date().toISOString(),
  };
}
