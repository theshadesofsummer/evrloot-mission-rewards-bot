module.exports = {
    findClassEmote,
    findClassEmoteObject
}

function findClassEmote(soulClass) {
    return ClassesWithText.get(soulClass);
}

function findClassEmoteObject(soulClass) {
    return ClassesWithObject.get(soulClass);
}

const ClassesWithText = new Map([
    ['Berserker', '<:berserker:1059415141856329829>'],
    ['Alchemist', '<:alchemist:1059415104606715944>'],
    ['Ranger', '<:ranger:1059415183484780614>']
]);

const ClassesWithObject = new Map([
    ['Berserker', {
        name: "berserker",
        id: "1059415141856329829"
    }],
    ['Alchemist', {
        name: "alchemist",
        id: "1059415104606715944"
    }],
    ['Ranger', {
        name: "ranger",
        id: "1059415183484780614"
    }]
]);
