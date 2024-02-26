
module.exports = function createRevealRecipeEmbed(availableRecipesAmount, discoveredRecipes) {

  const recipeFields = formatRecipes(discoveredRecipes);

  return {
    color: 0xae1917,
    title: `The Evrloot Recipe Book!`,
    description: `${discoveredRecipes.length} out of ${availableRecipesAmount} have been discovered`,
    fields: recipeFields,
    timestamp: new Date().toISOString(),
  };
}

function formatRecipes(recipes) {
  return recipes
    .map(recipe => ({
      name: recipe.name,
      value: `*${recipe.effect}*\nDiscovered by <@${recipe.discoveredBy}>`
    }))
}