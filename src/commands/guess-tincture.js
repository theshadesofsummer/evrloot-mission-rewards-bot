const {SlashCommandBuilder, AttachmentBuilder} = require("discord.js");
const config = require("../config");
const {getRevealStatus, addDiscoveredUser} = require("../reveal-status");
const createRevealPotionEmbed = require('../embeds/potion-reveal-embed')
const {postPotionReveal} = require("../discord-client");

module.exports = {
  cooldown: 60,
  data: new SlashCommandBuilder()
    .setName('guess-tincture')
    .setDescription('Discover one of new tincture recipes!')
    .addStringOption(option =>
      option.setName('tincture-name')
        .setDescription('The name of the new tincture "Tincture of ..."')
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply({
      ephemeral: true
    })

    const revealStatus = getRevealStatus()
    const availableTinctures = getAvailableTinctures(revealStatus)

    if (availableTinctures.length < 1) {
      await interaction.editReply({
        content: 'There are currently no tinctures ready to be discovered, come back soon!',
        ephemeral: true
      })
      return;
    }

    const guessedTinctureName = interaction.options.getString('tincture-name').toLowerCase();

    const matchingTincture = availableTinctures.find(tincture => {
      const tinctureName = tincture.name.toLowerCase()
      const tinctureNameWithoutPrefix = tinctureName.substring(12)

      return tinctureName.localeCompare(guessedTinctureName) === 0
        || tinctureNameWithoutPrefix.localeCompare(guessedTinctureName) === 0
    })

    if (!matchingTincture) {
      await interaction.editReply({
        content: `No tincture has this name, you may want to try again after the cooldown.`,
        ephemeral: true
      })
    } else {
      if (matchingTincture.discoveredBy !== null) {
        await interaction.editReply({
          content: `You found a tincture: *${matchingTincture.name}*!\n That has been found by <@${matchingTincture.discoveredBy}> first.`,
          ephemeral: true
        })
      } else {
        await interaction.editReply({
          content: `# You found a new tincture: *${matchingTincture.name}*!`,
          ephemeral: true
        })
        addDiscoveredUser(matchingTincture.name, interaction.user.id)
        const revealRecipeEmbed = createRevealPotionEmbed(matchingTincture, interaction.user)
        const attachments = new AttachmentBuilder()
          .setFile('static/' + matchingTincture.imageName)
          .setName(matchingTincture.imageName)
        await postPotionReveal(revealRecipeEmbed, attachments)
      }
    }
  }
};

function getAvailableTinctures(recipeStatus) {
  const daysRevealed = recipeStatus.daysRevealed
  return recipeStatus.tinctures.filter(recipe => daysRevealed.includes(recipe.availableOnDay))
}

function recipeIngredientsMatching(recipe, tinctureNa, me) {
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