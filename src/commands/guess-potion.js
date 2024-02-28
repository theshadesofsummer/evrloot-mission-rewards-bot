const {SlashCommandBuilder, AttachmentBuilder} = require("discord.js");
const config = require("../config");
const {getRevealStatus, addDiscoveredUser} = require("../reveal-status");
const createRevealPotionEmbed = require('../embeds/potion-reveal-embed')
const {postPotionReveal} = require("../discord-client");

const choices = [
  { name: 'Sandy Oasis Water', value: 'Sandy Oasis Water' },
  { name: 'Soft Palmwood', value: 'Soft Palmwood' },
  { name: 'New Resource #1', value: 'Glade Grass' },
  { name: 'New Resource #2', value: 'Cactus Leaf' },
  { name: 'New Resource #3', value: 'Dry Sand Herb' },
  // { name: 'New Resource #4', value: 'Mirage Sprout' },
  // { name: 'New Resource #5', value: 'Deep Root' }
]

module.exports = {
  cooldown: 60,
  data: new SlashCommandBuilder()
    .setName('guess-potion')
    .setDescription('Try to guess one of the new potion recipes including the new crafting resources!')
    .addStringOption(option =>
      option.setName('rss-name-1')
        .setDescription('(Required) The name of the first resource')
        .setRequired(true)
        .addChoices(...choices)
    )
    .addIntegerOption(option =>
      option.setName('rss-amount-1')
        .setDescription('(Required) The amount of the first resource')
        .setRequired(true)
        .setMinValue(1)
    )
    .addStringOption(option =>
      option.setName('rss-name-2')
        .setDescription('(Required) The name of the second resource')
        .setRequired(true)
        .addChoices(...choices)
    )
    .addIntegerOption(option =>
      option.setName('rss-amount-2')
        .setDescription('(Required) The amount of the second resource')
        .setRequired(true)
        .setMinValue(1)
    )
    .addStringOption(option =>
      option.setName('rss-name-3')
        .setDescription('(Optional) The name of the third resource')
        .addChoices(...choices)
    )
    .addIntegerOption(option =>
      option.setName('rss-amount-3')
        .setDescription('(Optional) The amount of the third resource')
        .setMinValue(1)
    ),
  async execute(interaction) {
    await interaction.deferReply({
      ephemeral: true
    })

    const revealStatus = getRevealStatus()
    const availablePotions = getAvailablePotions(revealStatus)

    if (availablePotions.length < 1) {
      await interaction.editReply({
        content: 'There are currently no potions ready to be discovered, come back soon!',
        ephemeral: true
      })
      return;
    }

    const rssName1 = interaction.options.getString('rss-name-1');
    const rssAmount1 = interaction.options.getInteger('rss-amount-1');
    const rssName2 = interaction.options.getString('rss-name-2');
    const rssAmount2 = interaction.options.getInteger('rss-amount-2');
    const rssName3 = interaction.options.getString('rss-name-3');
    const rssAmount3 = interaction.options.getInteger('rss-amount-3');

    if (resourceNamesDoubled(rssName1, rssName2, rssName3)){
      await interaction.editReply({
        content: 'You have entered multiple entries for the same resource.',
        ephemeral: true
      })
      return;
    }
    if (thirdEntryNotCorrect(rssName3, rssAmount3)){
      await interaction.editReply({
        content: 'If you specify a name or amount for the third resource, you need to fully specify the name and amount.',
        ephemeral: true
      })
      return;
    }

    const guessedPotionsMap = new Map();
    guessedPotionsMap.set(rssName1, rssAmount1)
    guessedPotionsMap.set(rssName2, rssAmount2)
    if (rssName3 !== null && rssAmount3 !== null)
      guessedPotionsMap.set(rssName3, rssAmount3)

    const guessedPotion = Array.from(guessedPotionsMap)

    const matchingPotion = availablePotions.find(potion => recipeIngredientsMatching(potion.ingredients, guessedPotion))
    console.log('matchingPotion', matchingPotion)

    if (!matchingPotion) {
      await interaction.editReply({
        content: `No potion has this combination of ingredients, you may want to try again after cooldown.`,
        ephemeral: true
      })
    } else {
      if (matchingPotion.discoveredBy !== null) {
        await interaction.editReply({
          content: `You found a new potion: *${matchingPotion.name}*!\n That has been found by <@${matchingPotion.discoveredBy}> first.`,
          ephemeral: true
        })
      } else {
        await interaction.editReply({
          content: `# You found a new potion: *${matchingPotion.name}*!`,
          ephemeral: true
        })
        addDiscoveredUser(matchingPotion.name, interaction.user.id)
        const revealRecipeEmbed = createRevealPotionEmbed(matchingPotion, interaction.user)
        const attachments = new AttachmentBuilder()
          .setFile('static/' + matchingPotion.imageName)
          .setName(matchingPotion.imageName)
        await postPotionReveal(revealRecipeEmbed, attachments)
      }
    }
  }
};

const isUserAllowed = userId =>
  config.tournament.allowedUserIDs.includes(userId);

function getAvailablePotions(recipeStatus) {
  const daysRevealed = recipeStatus.daysRevealed
  return recipeStatus.potions.filter(recipe => daysRevealed.includes(recipe.availableOnDay))
}

function resourceNamesDoubled(rssName1, rssName2, rssName3) {
  return rssName1.localeCompare(rssName2) === 0
    || rssName1.localeCompare(rssName3) === 0
    || rssName2.localeCompare(rssName3) === 0
}

function thirdEntryNotCorrect(rssName3, rssAmount3) {
  return (rssName3 !== null && rssAmount3 === null)
  || (rssName3 === null && rssAmount3 !== null)
}
function recipeIngredientsMatching(recipe, guessedRecipe) {
  if (recipe.length !== guessedRecipe.length) return false;

  const recipeMap = new Map(recipe)
  return guessedRecipe.every(ingredient => {
    if (!recipeMap.has(ingredient[0])) {
      return false;
    } else {
      const amount = recipeMap.get(ingredient[0])
      return amount === ingredient[1]
    }
  })
}