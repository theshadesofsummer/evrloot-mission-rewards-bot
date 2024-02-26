
module.exports = function createRevealPotionEmbed(recipe, user) {
  return {
    color: 0xae1917,
    author: {
      iconURL: user.avatarURL(),
      name: user.globalName
    },
    title: `New Potion Reveal!`,
    description: `${user.globalName} has found a new potion! Check all recipes with \`/recipe-book\``,
    fields: [
      {
        name: 'Name',
        value: recipe.name,
        inline: true
      },
      {
        name: 'Description',
        value: recipe.description,
        inline: true
      },
      {
        name: 'Effect',
        value: recipe.effect,
        inline: true
      },
      {
        name: 'Ingredients',
        value: formatIngredients(recipe.ingredients),
        inline: true
      }
    ],
    timestamp: new Date().toISOString(),
  };
}

function formatIngredients(ingredients) {
  return ingredients
    .map(ingredient => `*${ingredient[0]}*: ${ingredient[1]}`)
    .join('\n')
}