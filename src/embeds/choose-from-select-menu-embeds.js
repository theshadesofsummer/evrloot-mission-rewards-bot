const {findClassEmote} = require("../helpers/emotes.js");

const PAGE_SIZE = 5;

module.exports = {
    createChooseSoulEmbeds,
    createChooseOpponentEmbeds
}
function createChooseSoulEmbeds(souls) {
    const embeds = [];
    for (let page = 0; page < souls.length / PAGE_SIZE; page++) {
        embeds.push(createChooseChooseEmbed(souls, page, true))
    }
    return embeds;
}

function createChooseOpponentEmbeds(opponents) {
    const embeds = [];
    for (let page = 0; page < opponents.length / PAGE_SIZE; page++) {
        embeds.push(createChooseChooseEmbed(opponents, page, false))
    }
    return embeds;
}


function createChooseChooseEmbed(list, page, forSouls) {
    return {
        color: 0xae1917,
        title: `Choose your ${forSouls ? 'soul' : 'opponent'}!`,
        description: makeDescriptionFor(list, page, forSouls),
        timestamp: new Date().toISOString(),
    };
}

function makeDescriptionFor(list, page, forSouls) {
    let description = '';
    const firstElementIndex = page * PAGE_SIZE;

    const slicedList = list
        .slice(firstElementIndex, firstElementIndex + PAGE_SIZE)

    if (forSouls) {
        slicedList.forEach((soul, idx) => {
            const soulClass = soul.retrievedMetadata.properties['Soul Class'].value
            description += `\`[${firstElementIndex + idx + 1}]\` ${findClassEmote(soulClass)} ${soul.retrievedMetadata.name}\n`
        });
    } else {
        slicedList.forEach((username, idx) => {
            description += `\`[${firstElementIndex + idx + 1}]\` ${username}\n`
        });
    }


    return description;
}

