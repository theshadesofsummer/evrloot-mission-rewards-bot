
module.exports = function createResourceRewardEmbed(day, newResource) {
  return {
    color: 0xae1917,
    title: `Resource Reveal Day #${day}!`,
    description: `Time to showcase one of the new resources. Try to find the new possible crafting recipes with \`/guess-potion\`!`,
    fields: [
      {
        name: 'Name',
        value: newResource.name,
        inline: true
      },
      {
        name: 'Description',
        value: newResource.description,
        inline: true
      },
      {
        name: 'Rarity',
        value: newResource.rarity,
        inline: true
      }
    ],
    image: {
      url: `attachment://${newResource.imageFileName}`
    },
    timestamp: new Date().toISOString(),
  };
}
