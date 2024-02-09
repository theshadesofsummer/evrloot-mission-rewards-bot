const {getUserByClientId} = require("../discord-client");
const {findClassEmote} = require("../helpers/emotes");
const {findValueForAttribute} = require("../helpers/attribute-finder");
module.exports = async function createSoulMissionStatusEmbed(userId, soulList) {
  const user = await getUserByClientId(userId)

  return {
    color: 0xae1917,
    author: {
      iconURL: user.avatarURL(),
      name: user.globalName
    },
    title: `Claimable Souls: ${getClaimableSoulsNumber(soulList)}`,
    fields: [
      {
        name: 'Current Mission Status:',
        value: formatAll(soulList)
      }
    ],
  };
}

function getClaimableSoulsNumber(souls) {
  const allSouls = souls.length;
  const unclaimedFinishedSouls = souls.filter(soul => soul.lastPlayerMission.reachedEndTime && !soul.lastPlayerMission.claimedTime).length

  return `**${unclaimedFinishedSouls}**/${allSouls}`
}

function formatAll(souls) {
  let result = '';

  souls.forEach(soul => {
    const soulClassName = findValueForAttribute(soul.retrievedMetadata.attributes, "Soul Class")

    const endTime = new Date(soul.lastPlayerMission.endTime)


    result += `- ${findClassEmote(soulClassName)} **${soul.retrievedMetadata.name}**: *${soul.lastPlayerMission.mission.action}* `
    if (soul.lastPlayerMission.reachedEndTime) {
      if (soul.lastPlayerMission.claimedTime) {
        const claimedTime =  new Date(soul.lastPlayerMission.claimedTime)
        result += `💰 (claimed <t:${claimedTime.getTime() / 1000}:R>)\n`
      } else {
        result += `✅ (ended <t:${endTime.getTime() / 1000}:R>)\n`
      }
    } else {
      result += `⌛ claimable <t:${endTime.getTime() / 1000}:f> (<t:${endTime.getTime() / 1000}:R>)\n`
    }
  })

  return result
}