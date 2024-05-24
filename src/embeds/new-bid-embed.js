const {findValueForAttribute} = require("../helpers/attribute-finder");
const GLMR_DECIMALS = Math.pow(10, 18);
const TOKEN_INFOS = new Map([
  ['0xfFfFFfFf30478fAFBE935e466da114E14fB3563d', {
    ticker: 'PINK',
    decimals: Math.pow(10, 18)
  }]
])
module.exports = function createNewBidEmbed(bidInfo, textInfo, tradeCreator, bidCreator, bidNfts, bidResources) {
  const fields = []

  const glmrAmount = parseInt(bidInfo.offeredEther)
  const erc20Amount = parseInt(bidInfo.offeredErc20.amount)

  if (bidNfts.length > 0) {
    const nftInfo = bidNfts
      .map(formatNftLines)
      .join('\n')

    fields.push({
      name: 'Bid Nfts',
      value: nftInfo
    })
  }

  if (bidResources.length > 0) {
    const resourceInfo = bidResources
      .map(formatResourceLine)
      .join('\n')

    fields.push({
      name: 'Bid Resources',
      value: resourceInfo
    })
  }

  if (glmrAmount > 0) {
    const readableGlmrAmount = glmrAmount * 100 / GLMR_DECIMALS / 100.0 // e.g. 3.06
    fields.push({
      name: 'Offered Buy Out',
      value: `${readableGlmrAmount} $GLMR`
    });
  } else if (erc20Amount > 0){
    const erc20TokenInfo = TOKEN_INFOS.get(bidInfo.buyOutErc20.contractAddress)
    const readableErc20Amount = erc20Amount * 100 / erc20TokenInfo.decimals / 100.0
    fields.push({
      name: 'Offered Buy Out',
      value: `${readableErc20Amount} $${erc20TokenInfo.ticker}`
    });
  }

  let author = undefined
  if (bidCreator) {
    author = {
      iconURL: bidCreator.avatarURL(),
      name: bidCreator.globalName
    }
  } else {
    author = {
      name: 'Unknown user'
    }
  }

  const tradeCreatorInfo = tradeCreator ? `on ${bidCreator.globalName}'s trade` : ''

  return {
    color: 0x059e31,
    title: `New Bid: ${textInfo.title} ${tradeCreatorInfo}`,
    url: `https://game.evrloot.com/marketplace?mId=${bidInfo.trade.id}`,
    author,
    // thumbnail: {
    //   url: soul.retrievedMetadata.image
    // },
    description: textInfo.message,
    fields,
    timestamp: new Date().toISOString(),
  };
}

function formatResourceLine(resource) {
  return `${resource.amount}x **${resource.retrievedMetadata.name}** ${resource.emoteId}`
}
const relevantStatAttributes = [
  "Strength",
  "Dexterity",
  "Intelligence",
  "Wisdom",
  "Fortitude",
  "Luck",
  "Armor",
  "MinDamage",
  "MaxDamage",
  "Fishing",
]
const shortenedStatName = new Map([
  ["Strength", "STR"],
  ["Dexterity", "DEX"],
  ["Intelligence", "INT"],
  ["Wisdom", "WSDM"],
  ["Fortitude", "FOR"],
  ["Luck", "LUCK"],
  ["Armor", "ARMOR"],
  ["MinDamage", "MINDAM"],
  ["MaxDamage", "MAXDAM"],
  ["Fishing", "FISH"],
])
function formatNftLines(nft) {
  const rarity = findValueForAttribute(nft.attributes, 'Rarity')
  const relevantStats = nft.attributes.filter(attribute => relevantStatAttributes.includes(attribute.label))
  const formattedStats = relevantStats
    .map(stat => `\`(+${stat.value} ${shortenedStatName.get(stat.label)})\``)
    .join('\n')
  return `[${rarity}] **${nft.name}**\n${formattedStats}`
}