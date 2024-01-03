const {findClassEmote} = require("../helpers/emotes.js");
const {findValueForAttribute} = require("../helpers/attribute-finder");

const PAGE_SIZE = 5;

module.exports = {
    createChooseSoulEmbeds,
    createChooseSoulFighterEmbeds,
    createChooseOpponentEmbeds
}
function createChooseSoulEmbeds(souls) {
    const embeds = [];
    for (let page = 0; page < souls.length / PAGE_SIZE; page++) {
        embeds.push(createChooseChooseEmbed(souls, page, true))
    }
    return embeds;
}

function createChooseSoulFighterEmbeds(souls) {
    const embeds = [];
    for (let page = 0; page < souls.length / PAGE_SIZE; page++) {
        embeds.push(createChooseSoulsWithStatusEmbed(souls, page, true))
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

function createChooseSoulsWithStatusEmbed(list, page) {
    return {
        color: 0xae1917,
        title: `Choose your fighting soul!`,
        description: makeDescriptionForSoulFights(list, page),
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
            const soulClass = findValueForAttribute(soul.retrievedMetadata.attributes, 'Soul Class')
            description += `\`[${firstElementIndex + idx + 1}]\` ${findClassEmote(soulClass)} ${soul.retrievedMetadata.name}\n`
        });
    } else {
        slicedList.forEach((userId, idx) => {
            description += `\`[${firstElementIndex + idx + 1}]\` <@${userId}>\n`
        });
    }


    return description;
}

function makeDescriptionForSoulFights(soulList, page) {
    let description = '';
    const firstElementIndex = page * PAGE_SIZE;

    const slicedList = soulList
      .slice(firstElementIndex, firstElementIndex + PAGE_SIZE)

    slicedList.forEach((soul, idx) => {
      console.log(soul.retrievedMetadata, soul.metadata)
        const soulClass = findValueForAttribute(soul.retrievedMetadata.attributes, 'Soul Class')
        const status = soul.status;
        if (status === 'readyForFight')
            description += `\`[${firstElementIndex + idx + 1}]\` ${findClassEmote(soulClass)} ✅ ${soul.retrievedMetadata.name}\n`
        else if (status === 'waitingForFight')
            description += `\`[${firstElementIndex + idx + 1}]\` ${findClassEmote(soulClass)} ✉️ ~~${soul.retrievedMetadata.name}~~ [outgoing invitation to <@${soul.opponent}>]\n`
        else if (status === 'onCooldown')
            description += `\`[${firstElementIndex + idx + 1}]\` ${findClassEmote(soulClass)} ⏳ ~~${soul.retrievedMetadata.name}~~ [cooldown <t:${soul.cooldown}:f> (<t:${soul.cooldown}:R>)]\n`
    });



    return description;
}

