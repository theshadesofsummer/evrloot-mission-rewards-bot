const {getUserByClientId} = require("../discord-client");
const {findClassEmote} = require("../helpers/emotes");
const {findValueForAttribute} = require("../helpers/attribute-finder");
module.exports = async function createSoulMissionStatusEmbed(userId, soulList) {
  const user = await getUserByClientId(userId)
  const soulLines = formatAll(soulList)
  const fieldsBelowCharLimit = bringSoulLinesIntoChunks(soulLines)

  return {
    color: 0xae1917,
    author: {
      iconURL: user.avatarURL(),
      name: user.globalName
    },
    title: `Claimable Souls: ${getClaimableSoulsNumber(soulList)}`,
    fields: formatFieldsArray(fieldsBelowCharLimit),
  };
}

function getClaimableSoulsNumber(souls) {
  const allSouls = souls.length;
  const unclaimedFinishedSouls = souls.filter(soul => soul.lastPlayerMission.reachedEndTime && !soul.lastPlayerMission.claimedTime).length

  return `**${unclaimedFinishedSouls}**/${allSouls}`
}

function formatAll(souls) {
  let result = [];

  souls.forEach(soul => {
    let soulString = '- '
    const soulClassName = findValueForAttribute(soul.retrievedMetadata.attributes, "Soul Class")

    const endTime = new Date(soul.lastPlayerMission.endTime)

    if (soul.lastPlayerMission.reachedEndTime) {
      if (soul.lastPlayerMission.claimedTime) {
        soulString += `💰 `
      } else {
        soulString += `✅ `
      }
    } else {
      soulString += `⌛ `
    }


    soulString += `${findClassEmote(soulClassName)} **${soul.retrievedMetadata.name}**: *${soul.lastPlayerMission.mission.action}* `
    if (soul.lastPlayerMission.reachedEndTime) {
      if (soul.lastPlayerMission.claimedTime) {
        const claimedTime =  new Date(soul.lastPlayerMission.claimedTime)
        soulString += `(claimed <t:${claimedTime.getTime() / 1000}:R>)\n`
      } else {
        soulString += `(ended <t:${endTime.getTime() / 1000}:R>)\n`
      }
    } else {
      soulString += `claimable <t:${endTime.getTime() / 1000}:f> (<t:${endTime.getTime() / 1000}:R>)\n`
    }

    result.push(soulString)
  })

  return result
}

function bringSoulLinesIntoChunks(soulLines) {
  const chunks = []

  let i = 0
  let concatStringForOneChunk = ''

  while (i < soulLines.length) {
    const projectedNewLength = concatStringForOneChunk.length + soulLines[i].length
    if (projectedNewLength > 1024) {
      chunks.push(concatStringForOneChunk)
      concatStringForOneChunk = ''
    } else {
      concatStringForOneChunk += soulLines[i]
      i++;
    }
  }
  chunks.push(concatStringForOneChunk)

  return chunks
}
function formatFieldsArray(fieldsBelowCharLimit) {
  return fieldsBelowCharLimit.map((chunk, idx) => ({
    name: `Current Mission Status: (${idx+1}/${fieldsBelowCharLimit.length})`,
    value: chunk
  }))

}