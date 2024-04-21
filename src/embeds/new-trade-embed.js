const {findValueForAttribute} = require("../helpers/attribute-finder");
const GLMR_DECIMALS = Math.pow(10, 18);
const TOKEN_INFOS = new Map([
  ['0x7D23Be80b71Dfe922E17407CaB9F9B8c796835D4', {
    ticker: 'tEVR',
    decimals: Math.pow(10, 18)
  }]
])
module.exports = function createNewTradeEmbed(tradeInfo, tradeNfts, tradeResources) {
  const fields = []

  const glmrAmount = parseInt(tradeInfo.buyOutEther)
  const erc20Amount = parseInt(tradeInfo.buyOutErc20.amount)

  if (tradeNfts.length > 0) {
    const nftInfo = tradeNfts
      .map(formatNftLines)
      .join('\n')

    fields.push({
      name: 'Nfts',
      value: nftInfo
    })
  }

  if (tradeResources.length > 0) {
    const resourceInfo = tradeResources
      .map(formatResourceLine)
      .join('\n')

    fields.push({
      name: 'Resources',
      value: resourceInfo
    })
  }

  if (glmrAmount > 0) {
    const readableGlmrAmount = glmrAmount * 100 / GLMR_DECIMALS / 100.0 // e.g. 3.06
    fields.push({
      name: 'Buy Out',
      value: `${readableGlmrAmount} $GLMR`
    });
  } else if (erc20Amount > 0){
    const erc20TokenInfo = TOKEN_INFOS.get(tradeInfo.buyOutErc20.contractAddress)
    const readableErc20Amount = erc20Amount * 100 / erc20TokenInfo.decimals / 100.0
    fields.push({
      name: 'Buy Out',
      value: `${readableErc20Amount} $${erc20TokenInfo.ticker}`
    });
  }

  return {
    color: 0x5308a8,
    title: 'New Trade on the marketplace!',
    author: {
      name: `no name`,
      //icon_url: `https://game.evrloot.com/Soulclaim/${findValueForAttribute(attributes, 'Soul Class').toLowerCase()}.png`,
    },
    // thumbnail: {
    //   url: soul.retrievedMetadata.image
    // },
    description: '',
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