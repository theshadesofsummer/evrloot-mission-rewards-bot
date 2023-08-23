const {getFightByFightId, deleteFight} = require("../../evrloot-db");
const {startFight} = require("../../evrloot-api");
const createFightEmbed = require('../../embeds/fight-embed')
const {postFightResult} = require("../../discord-client");

module.exports = async function (interaction, fightId) {
  const fight = await getFightByFightId(fightId);

  const fightResult = await startFight(fight.soulA, fight.soulB)

  await deleteFight(fight._id)

  console.log('fightResult', fightResult)

  await postFightResult(createFightEmbed(fight, fightResult))

}