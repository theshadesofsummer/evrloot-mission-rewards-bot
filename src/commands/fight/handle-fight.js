const {getFightByFightId, deleteFight} = require("../../evrloot-db");
const {startFight} = require("../../evrloot-api");
const createFightEmbed = require('../../embeds/fight-embed')
const {postFightResult} = require("../../discord-client");
const {ThreadAutoArchiveDuration} = require("discord-api-types/v10");

module.exports = async function (interaction, fightId) {
  const fight = await getFightByFightId(fightId);

  const fightResult = await startFight(fight.soulA, fight.soulB)

  await deleteFight(fight._id)

  const fightMessage = await postFightResult(createFightEmbed(fight, fightResult[0]))

  const fightThread = await fightMessage.startThread({
    name: `${fight.fighterA} vs. ${fight.fighterB}`,
    autoArchiveDuration: ThreadAutoArchiveDuration.OneHour
  })

  sendCombatRounds(fightThread, fightResult[0].combatRounds)
}

function sendCombatRounds(combatRounds) {

}