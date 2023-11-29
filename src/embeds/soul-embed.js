const {findValueForAttribute} = require("../helpers/attribute-finder");
module.exports = function createSoulEmbed(soul, user) {
    const { soulSpecificStatName, soulSpecificStatValue } = soulClassSpecificName(soul);
    const attributes = soul.retrievedMetadata.attributes;

    return [{
        color: 0xae1917,
        title: soul.retrievedMetadata.name,
        author: {
            name: `requested by ${user.username}`,
            icon_url: `https://game.evrloot.com/Soulclaim/${findValueForAttribute(attributes, 'Soul Class').toLowerCase()}.png`,
        },
        thumbnail: {
            url: soul.retrievedMetadata.image
        },
        fields: [
            {
                name: 'Personality',
                value: findValueForAttribute(attributes, 'Personality'),
                inline: true
            },
            {
                name: 'Talent',
                value: findValueForAttribute(attributes, 'Talent'),
                inline: true
            },
            {
                name: 'Origin',
                value: findValueForAttribute(attributes, 'Origin'),
                inline: true
            },
            {
                name: 'Condition',
                value: findValueForAttribute(attributes, 'Condition'),
                inline: true
            },
            {
                name: soulSpecificStatName,
                value: soulSpecificStatValue,
                inline: true,
            },
            {
                name: '',
                value: '',
                inline: true,
            },
            {
                name: 'Stats',
                value: statsFormatter(soul),
                inline: true
            },
            {
                name: 'Experience',
                value: experienceFormatter(soul.experience),
                inline: true
            },
        ],
        timestamp: new Date().toISOString(),
    }];
}

const specificClassNames = new Map([
    ["Alchemist", "Specialty"],
    ["Berserker", "Role"],
    ["Ranger", "Spirit Animal"]
])
function soulClassSpecificName(attributes) {
    const statName = specificClassNames.get(findValueForAttribute(attributes, "Soul Class"));
    const statValue = findValueForAttribute(attributes, statName);

    return {
        soulSpecificStatName: statName,
        soulSpecificStatValue: statValue,
    }
}

function statsFormatter(soul) {
    const attributes = soul.retrievedMetadata.attributes;

    return `*Strength*: ${getStatFormat(findValueForAttribute(attributes, 'Strength'), 8)} ${upgradedStat(soul.children, 'Strength')}\n` +
            `*Dexterity*: ${getStatFormat(findValueForAttribute(attributes, 'Dexterity'), 8)} ${upgradedStat(soul.children, 'Dexterity')}\n` +
            `*Intelligence*: ${getStatFormat(findValueForAttribute(attributes, 'Intelligence'), 8)} ${upgradedStat(soul.children, 'Intelligence')}\n` +
            `*Wisdom*: ${getStatFormat(findValueForAttribute(attributes, 'Wisdom'), 8)} ${upgradedStat(soul.children, 'Wisdom')}\n` +
            `*Fortitude*: ${getStatFormat(findValueForAttribute(attributes, 'Fortitude'), 8)} ${upgradedStat(soul.children, 'Fortitude')}\n` +
            `*Luck*: ${getStatFormat(findValueForAttribute(attributes, 'Luck'), 4)} ${upgradedStat(soul.children, 'Luck')}`;
}

function getStatFormat(stat, goodValue) {
    return stat >= goodValue ? `**${stat}**` : stat.toString();
}

function upgradedStat(soulChildren, statType) {
    // const effectingChildNfts = soulChildren
    //     .filter(childNft => childNft.retrievedMetadata.properties[statType])
    //
    // if (effectingChildNfts.length < 1) return ""
    //
    // const upgradeAmount = effectingChildNfts.reduce((acc, childNft) => acc + Number(childNft.retrievedMetadata.properties[statType].value), 0)
    // return `***+${upgradeAmount}***`;
    return ''
}

function experienceFormatter(soulExperience) {
    const validActivities = soulExperience.activities.filter(activity => activity.activityId !== 0) // activity with id 0 is called unknown kek

    let returnString = '';
    for (const activity of validActivities) {
        returnString += `*${activity.activityName}*: ${getRankName(activity.experience)} (${activity.experience}/${getNextLevel(activity.experience)})\n`
    }

    return returnString;
}

function getRankName(currentExp) {
    const lvlNames = [
        'Unskilled',
        'Amateur',
        'Beginner',
        'Novice',
        'Rookie',
        'Adept',
        'Apprentice',
        'Journeyman',
        'Expert',
        'Master',
        'Artisan',
        'Grandmaster',
        'Legendary',
    ];

    let nextLevelBarrier = 100;
    let lvlNameCounter = 0;
    while (nextLevelBarrier < currentExp) {
        nextLevelBarrier = nextLevelBarrier << 1
        lvlNameCounter++;
    }
    return lvlNames[lvlNameCounter];
}

function getNextLevel(currentExp) {
    let nextLevelBarrier = 100;
    while (nextLevelBarrier < currentExp) {
        nextLevelBarrier = nextLevelBarrier << 1
    }
    return nextLevelBarrier
}