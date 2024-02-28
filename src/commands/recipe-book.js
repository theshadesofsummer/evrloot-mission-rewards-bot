const {SlashCommandBuilder} = require("discord.js");
const createRecipeBookEmbed = require('../embeds/recipe-book-embed')
const {getRevealStatus} = require("../reveal-status");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('recipe-book')
    .setDescription('See all discovered new recipes!'),
  async execute(interaction) {
    await interaction.deferReply({
      ephemeral: true
    })

    const revealStatus = getRevealStatus()
    const availableRecipes = getDiscoveredRecipes(revealStatus)
    const discoveredRecipes = availableRecipes.filter(recipe => recipe.discoveredBy !== null);

    const recipeBookEmbed = createRecipeBookEmbed(availableRecipes.length, discoveredRecipes)

    await interaction.editReply({
      embeds: [recipeBookEmbed],
      ephemeral: true
    })
  }
};

function getDiscoveredRecipes(recipeStatus) {
  const daysRevealed = recipeStatus.daysRevealed
  const potions = recipeStatus.potions.filter(recipe => daysRevealed.includes(recipe.availableOnDay))
  const tinctures = recipeStatus.tinctures.filter(recipe => daysRevealed.includes(recipe.availableOnDay))
  return [...potions, ...tinctures]
}