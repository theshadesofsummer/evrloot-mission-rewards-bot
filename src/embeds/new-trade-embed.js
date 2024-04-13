const GLMR_DECIMALS = Math.pow(10, 18);
const TOKEN_INFOS = new Map([
  ['0x7D23Be80b71Dfe922E17407CaB9F9B8c796835D4', {
    ticker: 'tEVR',
    decimals: Math.pow(10, 18)
  }]
])
module.exports = function createNewTradeEmbed(tradeInfo, tradeResources) {
  const fields = []

  const glmrAmount = parseInt(tradeInfo.buyOutEther)
  const erc20Amount = parseInt(tradeInfo.buyOutErc20.amount)

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
  console.log('only resource to format', resource)
  return `${resource.amount}x **${resource.retrievedMetadata.name}** ${resource.emoteId}`
}