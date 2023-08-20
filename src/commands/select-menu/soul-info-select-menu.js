const {getNft} = require("../../evrloot-api.js");
const {createSoulEmbed} = require("../../embeds/soul-embed.js");

module.exports = {
    async execute(interaction) {
        const soulId = interaction.values[0];

        console.log('requested', soulId, 'by', interaction.message.interaction.user.username);

        const soul = await getNft(soulId);

        interaction.reply({
            embeds: createSoulEmbed(soul, interaction.message.interaction.user),
        })
    },
}
