const { postEmbed } = require('./discord-bot.js')
const createMissionRewardEmbed = require('./embeds/mission-reward-embed.js')
const { getMissionInformation } = require("./abi-interaction.js");

module.exports = {
  missionReward
}

async function missionReward(eventInput) {
  console.log('missionReward > eventInput', eventInput)
  console.log('missionReward > eventInput > returnValues', eventInput.returnValues)

  const missionInformation = await getMissionInformation(eventInput.returnValues.missionId)
  console.log('handleBid > missionInformation', auctionInformation)

  await postEmbed(createMissionRewardEmbed(eventInputreturnValues.missionId, auctionInformation));
}