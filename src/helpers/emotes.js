module.exports = {
  findClassEmote,
  findClassEmoteObject
}

function findClassEmote(soulClass) {
  return soulClassEmoteMap.get(soulClass);
}

function findClassEmoteObject(soulClass) {
  return ClassesWithObject.get(soulClass);
}

const soulClassEmoteMap = new Map([
  ['Berserker', '<:berserker_logo:1276288005245632522>'],
  ['Alchemist', '<:alchemist_logo:1276288001990725665>'],
  ['Ranger', '<:ranger_logo:1276288006793330708>'],
  ['Behemoth', '<:behemoth_logo:1276288003844866151>'],
  ['Sand Shaper', '<:sandshaper_logo:1276288000740823194>'],
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
