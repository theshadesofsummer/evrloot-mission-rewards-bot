const {findClassEmote} = require("../helpers/emotes.js");

const PAGE_SIZE = 5;

module.exports = {
    createChooseSoulEmbeds
}
function createChooseSoulEmbeds(souls) {
    const embeds = [];
    for (let page = 0; page < souls.length / PAGE_SIZE; page++) {
        embeds.push(createChooseSoulEmbed(souls, page))
    }
    return embeds;
}

function createChooseSoulEmbed(souls, page) {
    return {
        color: 0xae1917,
        title: `Choose your soul!`,
        description: soulList(souls, page),
        timestamp: new Date().toISOString(),
    };
}

function soulList(souls, page) {
    let description = '';
    const firstElementIndex = page * PAGE_SIZE;

    const slicedSouls = souls
        .slice(firstElementIndex, firstElementIndex + PAGE_SIZE)

    slicedSouls.forEach((soul, idx) => {
        const soulClass = soul.retrievedMetadata.properties['Soul Class'].value
        description += `\`[${firstElementIndex + idx + 1}]\` ${findClassEmote(soulClass)} ${soul.retrievedMetadata.name}\n`
    });

    return description;
}
