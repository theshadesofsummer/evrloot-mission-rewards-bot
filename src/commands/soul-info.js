const {ActionRowBuilder, StringSelectMenuBuilder, SlashCommandBuilder} = require("discord.js");
const {createChooseSoulEmbeds} = require("../embeds/choose-soul-embeds.js");
const {ExtraRowPosition, Pagination} = require("pagination.djs");
const {findClassEmoteObject} = require("../helpers/emotes.js");
const {getSouls} = require("../evrloot-api.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('soul-info')
        .setDescription('Show of your legendary soul(s) to others!')
        .addStringOption(option =>
            option.setName('address')
                .setDescription('Put in the moonbeam address of your wallet (0x...)')
                .setRequired(true)
                .setMaxLength(42)
                .setMinLength(42)
        ),

    async execute(interaction) {
        interaction.deferReply({
            ephemeral: true
        })
        const address = interaction.options.getString('address')
        const souls = await getSouls(address);

        console.log('user', interaction.user.username, 'requested souls of', address);

        const embeds = createChooseSoulEmbeds(souls);

        const pagination = new Pagination(interaction)
            .setEmbeds(embeds)
            .setEphemeral(true)
            .addActionRows([createSelectMenuRow(souls)], ExtraRowPosition.Below);

        await pagination.render();
    },
};

function createSelectMenuRow(souls) {
    const chooseSoulButtons = souls.map((soul, index) => ({
        label: `[${index+1}] ${soul.retrievedMetadata.name}`,
        value: soul.id,
        emoji: findClassEmoteObject(soul.retrievedMetadata.properties['Soul Class'].value)
    }));
    const chooseSoulSelectMenu = new StringSelectMenuBuilder()
        .setCustomId("choose-soul-menu")
        .addOptions(chooseSoulButtons)
    return new ActionRowBuilder().setComponents(chooseSoulSelectMenu)
}