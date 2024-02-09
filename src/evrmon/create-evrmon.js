const {generateEvrmon} = require("./generate-evrmon-stats");
const {saveEvrmon} = require("../evrmon-db");
const createEvrmonRevealEmbed = require("./reveal-embed")

module.exports = {
  createEvrmon
}

const ALL_STATS = [
  "Strength",
  "Dexterity",
  "Intelligence",
  "Wisdom",
  "Fortitude",
  "Luck",
  "Armor"
]

async function createEvrmon(interaction, userId) {
  interaction.editReply('Your Evrmon is being created...')

  const newEvrmon = generateEvrmon(userId);
  //await saveEvrmon(userId, newEvrmon);

  const revealEmbed = await createEvrmonRevealEmbed(newEvrmon);

  await interaction.editReply({
    content: '',
    embeds: [revealEmbed]
  })

  await sleep(1000)

  for (let i = 0; i < 7; i++) {


    const statsTexts = revealEmbed.fields[0].value.split('\n')
    let newStatsText = statsTexts[i]
    const stat = ALL_STATS.find(statName => newStatsText.includes(statName))
    newStatsText = newStatsText.replace('<a:dice:1202953142338326549> Being Randomized... <a:dice:1202953142338326549>', `||\` ${newEvrmon[stat]} \`||`)

    statsTexts[i] = newStatsText
    revealEmbed.fields[0].value = statsTexts.join("\n");

    await interaction.editReply({
      content: '',
      embeds: [revealEmbed]
    })

    await sleep(300)
  }

}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
