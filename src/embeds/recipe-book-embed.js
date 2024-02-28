
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
      name: `${recipe.name} ${recipe.emote}`,
      value: formatRecipeInfo(recipe)
    }))
}

function formatRecipeInfo(recipe) {
  let result = '';
  result += `*${recipe.effect}*\n`
  result += `${formatIngredients(recipe.ingredients)}\n`
  result += `Discovered by <@${recipe.discoveredBy}>`
  return result;
}

function formatIngredients(ingredients) {
  return ingredients
    .map(ingredient => `${ingredient[1]}x ${ingredient[0]}`)
    .join(', ')
}