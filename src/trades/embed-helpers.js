const {GLMR_DECIMALS, TOKEN_INFOS} = require("./trade-helpers");
const {findValueForAttribute} = require("../helpers/attribute-finder");

module.exports = {
  getFields,
  getAuthor
}

function getFields(tradeInfo, tradeNfts, tradeResources, forTrade) {
  const fields = []

  if (tradeNfts.length > 0) {
    const nftInfo = tradeNfts
      .map(formatNftLines)
      .join('\n')

    fields.push({
      name: forTrade ? 'Trade Nfts' : 'Bid Nfts',
      value: nftInfo
    })
  }

  if (tradeResources.length > 0) {
    const resourceInfo = tradeResources
      .map(formatResourceLine)
      .join('\n')

    fields.push({
      name: forTrade ? 'Trade Resources' : 'Bid Resources',
      value: resourceInfo
    })
  }

  const glmrAmountTrade = parseInt(tradeInfo.buyOutEther)
  const glmrAmountBid = parseInt(tradeInfo.offeredEther)
  const erc20Trade = parseInt(tradeInfo.buyOutErc20.amount)
  const erc20Bid = parseInt(tradeInfo.offeredErc20.amount)

  const glmrAmount = forTrade ? glmrAmountTrade : glmrAmountBid
  const erc20 = forTrade ? erc20Trade : erc20Bid

  if (glmrAmount > 0) {
    const readableGlmrAmount = glmrAmount * 100 / GLMR_DECIMALS / 100.0 // e.g. 3.06
    fields.push({
      name: forTrade ? 'Trade Buy Out' : 'Offered Buy Out',
      value: `${readableGlmrAmount} $GLMR`
    });
  } else if (erc20.amount > 0){
    const erc20TokenInfo = TOKEN_INFOS.get(tradeInfo.erc20.contractAddress)
    const readableErc20Amount = erc20.amount * 100 / erc20TokenInfo.decimals / 100.0
    fields.push({
      name: forTrade ? 'Trade Buy Out' : 'Offered Buy Out',
      value: `${readableErc20Amount} $${erc20TokenInfo.ticker}`
    });
  }

  return fields
}

function getAuthor(user) {
  return user ? {
    iconURL: user.avatarURL(),
    name: user.globalName
  } : {
    name: 'Unknown user'
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