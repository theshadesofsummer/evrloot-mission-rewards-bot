const UNIDENTIFIED_FISH_V2_URI = 'ipfs://QmTxsyfYkJPszKZm2iwitxppg9Y35eAhjkAVV7pAuuvt5i/';
const FISH_SPECIALGROUPS_DECEMBER = 'ipfs://QmaYvEES5mYz1HLXrzqdHWUcwngQsGZPmRSJeMycC3cA8U/';
const UNIDENTIFIED_ALPHA_URI_COMMONTEST =
  'ipfs://QmNq8puefqR1tpEmKeafJMgGKsCwGWEUDZVmVmcXs3tcfs';
const UNIDENTIFIED_ALPHA_URI_RARETEST =
  'ipfs://QmcZk4udFs3youLppijqQ7cAmYRNzCC55NDhqvcsc3UW7g';
const UNIDENTIFIED_ALPHA_URI_EPICTEST =
  'ipfs://QmShxqtstA14BzGwuE8ywv2kDUM91foNYhRdxdhce5XAcS';
const UNIDENTIFIED_ALPHA_URI_LEGENDARYTEST =
  'ipfs://QmbSFPgaN6sAc9BdTGgcMGzNzY1UbYMthKdzsVJwAGtDdn';

const moonbeamContracts = { //contractAddresses.ts
  NestableSoul: '0x9D1454e198F4b601BfC0069003045b0CBC0e6749',
  NestableLoot: '0x29b58A7fCeecF0C84e62301E5b933416a1DB0599',
  RangerBase: '0x4A0e985D52777fb1E71eCbA2b7174754Fe59701a',
  BerserkerBase: '0x38E3855834D6676C21764bc2661ABD7e67304661',
  AlchemistBase: '0x6AA04FBaA07e3A3F548cb0AE04b5E32C0a5fCFa9',
  EquipRenderUtils: '0x40Cd07929B39FD05E640bc673A34d7D85d500366',
  MigrationUtils: '0x361d48fEf21f1ac7E213FF9fbeda465CF2e7F25b',
  Resources: '0x07801e1d8d868b351c83fd10dE74abA7c5E989ea',
  NestableBoard: '0x27e1FcC48ecf200c953870d75da1b0e5E2930998',
  NestableFish: '0x95492EdCC1D373E236E368973285Ad47D56D07b6',
  BoardBase: '0x1410cCB883e99cAB68bb0B4313B2af61aaCF8907',
  Diamond: '0xba6bd2Aace40c9a14c4123717119a80e9fe6738A',
  QrngSponsor: '0x2ab8917AFEca5B0C232517aA15B84bBEaf5868E8', //'0x17477607eD93f5817400d1E524622Ee6aAebd5DF', // '0xA51EA265d3460493738Efc596be7d60106af0DB7',
  EvrlootQrng: '0x089f7f7e0f048F691074Bb9B7D57Caed197Fb426', //'0x0d8D79184104831B249b0266A8Dcd0F5E36b04e1',
  Uint256Endpoint: '0xffd1bbe880e7b2c662f6c8511b15ff22d12a4a35d5c8c17202893a5f10e25284', //0xfb6d017bb87991b7495f563db3c8cf59ff87b09781947bb1e417006ad7f55a78 (anu)
  AirNodeRRP: '0xa0AD79D995DdeeB18a14eAef56A549A04e3Aa1Bd',
  AirNode: '0x224e030f03Cd3440D88BD78C9BF5Ed36458A1A25', //'0x9d3C147cA16DB954873A498e0af5852AB39139f2',
  AlphaTest: '0xCD70e6cc957d802Def6de66482f04C76c99E4E61',
  NestableLootV2: '0x2931b4e6E75293f8E94e893ce7BdfAb5521f3fCD',
  NestableFishV2: '0xEe2558C59E4263990Da65e588F3437A7bdD15e0b',
  MigrationUtilsV2: '0xaD515b22ad0aF82ce8C1b36FFb708371C7C1613c',
  NestableTriumph: '0x3ab5dE066e2EC546DbFB99ceb8bee9bf300Ff6FF',
  BotanistBase: '0xf0A4AC2f87D2dDEa2871116302AFb48Be3cCba5F',
  BotanistWorkshop: '0x60e05ae30EC8b396d30C3583437e1E161ADa91F7',
  NestableTriumphV2: '0xa2E8DA13f06ad807D543bB3BB0Bd6eC53a044B47', // later update TriumphV1 to this and remove V2
  LGFDuneLeapers: '0x008afe13395a131f252427c13c75369431d34654',
}

// ipfs links in ipfsLinks.ts
const itemIds = {
  //-----FISH V2-----
  'Common Fish': {
    poolId: 1,
    memberId: 0,
    contractAddress: moonbeamContracts['NestableFishV2'],
    tokenUri: `${UNIDENTIFIED_FISH_V2_URI}commonFish.json`,
    name: 'Common Fish',
    emoteId: '<:common_fish:1160346016713805855>'
  }, //'COMMON',
  'Rare Fish': {
    poolId: 2,
    memberId: 0,
    contractAddress: moonbeamContracts['NestableFishV2'],
    tokenUri: `${UNIDENTIFIED_FISH_V2_URI}rareFish.json`,
    name: 'Rare Fish',
    emoteId: '<:rare_fish:1160348216332664842>'
  }, //'RARE',
  'Epic Fish': {
    poolId: 3,
    memberId: 0,
    contractAddress: moonbeamContracts['NestableFishV2'],
    tokenUri: `${UNIDENTIFIED_FISH_V2_URI}epicFish.json`,
    name: 'Epic Fish',
    emoteId: '<:epic_fish:1160346025144373439>'
  }, //'EPIC',
  'Legendary Fish': {
    poolId: 4,
    memberId: 0,
    contractAddress: moonbeamContracts['NestableFishV2'],
    tokenUri: `${UNIDENTIFIED_FISH_V2_URI}legendaryFish.json`,
    name: 'Legendary Fish',
    emoteId: '<:legendary_fish:1160369974737637376>'
  }, //'LEGENDARY',
  'Seasoned Hunter': {
    poolId: 5,
    memberId: 0,
    contractAddress: moonbeamContracts['NestableFishV2'],
    tokenUri: `${FISH_SPECIALGROUPS_DECEMBER}seasoned-hunter.json`,
    name: 'Seasoned Hunter',
    emoteId: '<:SeasonedHunter:1189975409354342400>'
  },
  'Living Fossil': {
    poolId: 6,
    memberId: 0,
    contractAddress: moonbeamContracts['NestableFishV2'],
    tokenUri: `${FISH_SPECIALGROUPS_DECEMBER}living-fossil.json`,
    name: 'Living Fossil',
    emoteId: '<:LivingFossil:1189975404178575431>'
  },
  'Master of Disguise': {
    poolId: 7,
    memberId: 0,
    contractAddress: moonbeamContracts['NestableFishV2'],
    tokenUri: `${FISH_SPECIALGROUPS_DECEMBER}master-of-disguise.json`,
    name: 'Master of Disguise',
    emoteId: '<:MasterOfDisguise:1189975407508861050>'
  },
  'Translucent Catch': {
    poolId: 8,
    memberId: 0,
    contractAddress: moonbeamContracts['NestableFishV2'],
    tokenUri: `${FISH_SPECIALGROUPS_DECEMBER}translucent-catch.json`,
    name: 'Translucent Catch',
    emoteId: '<:TranslucentCatch:1189975413569638531>'
  },
  'Elusive Crustacean': {
    poolId: 9,
    memberId: 0,
    contractAddress: moonbeamContracts['NestableFishV2'],
    tokenUri: `${FISH_SPECIALGROUPS_DECEMBER}elusive-crustaceans.json`,
    name: 'Elusive Crustacean',
    emoteId: '<:ElusiveCrustacian:1189975399275442268>'
  },
  'Foreign Creature': {
    poolId: 10,
    memberId: 0,
    contractAddress: moonbeamContracts['NestableFishV2'],
    tokenUri: `${FISH_SPECIALGROUPS_DECEMBER}foreign-creature.json`,
    name: 'Foreign Creature',
    emoteId: '<:ForeignCreature:1189975401812996228>'
  },
  'Maelstrom Catch': {
    poolId: 11,
    memberId: 0,
    contractAddress: moonbeamContracts['NestableFishV2'],
    tokenUri: `${FISH_SPECIALGROUPS_DECEMBER}maelstorm-catch.json`,
    name: 'Maelstrom Catch',
    emoteId: '<:Maelstrom:1189975405944373409>'
  },

  //-----TRIUMPH-----
  'Common Triumph': {
    poolId: 1,
    memberId: 0,
    contractAddress: moonbeamContracts['NestableTriumphV2'],
    tokenUri: `${UNIDENTIFIED_ALPHA_URI_COMMONTEST}`,
    name: 'Common Triumph',
    emoteId: ''
  }, //'COMMON',
  'Rare Triumph': {
    poolId: 2,
    memberId: 0,
    contractAddress: moonbeamContracts['NestableTriumphV2'],
    tokenUri: `${UNIDENTIFIED_ALPHA_URI_RARETEST}`,
    name: 'Rare Triumph',
    emoteId: ''
  }, //'RARE',
  'Epic Triumph': {
    poolId: 3,
    memberId: 0,
    contractAddress: moonbeamContracts['NestableTriumphV2'],
    tokenUri: `${UNIDENTIFIED_ALPHA_URI_EPICTEST}`,
    name: 'Epic Triumph',
    emoteId: ''
  }, //'EPIC',
  'Legendary Triumph': {
    poolId: 4,
    memberId: 0,
    contractAddress: moonbeamContracts['NestableTriumphV2'],
    tokenUri: `${UNIDENTIFIED_ALPHA_URI_LEGENDARYTEST}`,
    name: 'Legendary Triumph',
    emoteId: ''
  }, //'LEGENDARY',
  'Beginners Workbench': {
    poolId: 2,
    memberId: 7,
    contractAddress: moonbeamContracts['NestableTriumphV2'],
    tokenUri: `${UNIDENTIFIED_ALPHA_URI_LEGENDARYTEST}`,
    name: 'Beginners Workbench',
    emoteId: ''
  },
  'Archaeological Wall Painting': {
    poolId: 3,
    memberId: 13,
    contractAddress: moonbeamContracts['NestableTriumphV2'],
    tokenUri: `${UNIDENTIFIED_ALPHA_URI_LEGENDARYTEST}`,
    name: 'Archaeological Wall Painting',
    emoteId: ''
  },
  'Trakan Alleys': {
    poolId: 4,
    memberId: 17,
    contractAddress: moonbeamContracts['NestableTriumphV2'],
    tokenUri: `${UNIDENTIFIED_ALPHA_URI_LEGENDARYTEST}`,
    name: 'Trakan Alleys',
    emoteId: ''
  },

  //-----LOOTV2-----
  'Crafting Item': {
    poolId: 0,
    memberId: 0,
    contractAddress: moonbeamContracts['NestableLootV2'],
    tokenUri: ``,
    name: 'Crafting Item',
    emoteId: ''
  },
  'Makeshift Palm Rod': {
    poolId: 0,
    memberId: 1,
    contractAddress: moonbeamContracts['NestableLootV2'],
    tokenUri: `ipfs://QmTtrvYzqijTUs5b4kdCFzSrBCoydRPQm4gSo8CJomk88e/ULOXRD.json`,
    name: 'Makeshift Palm Rod',
    emoteId: '<:makeshift_palm_rod:1160346056710705192>'
  },
  'Reinforced Palm Rod': {
    poolId: 0,
    memberId: 2,
    contractAddress: moonbeamContracts['NestableLootV2'],
    tokenUri: `ipfs://QmTtrvYzqijTUs5b4kdCFzSrBCoydRPQm4gSo8CJomk88e/240SHV.json`,
    name: 'Reinforced Palm Rod',
    emoteId: '<:reinforced_palm_rod:1160346070606426122>'
  },
  'Akuban Rod': {
    poolId: 0,
    memberId: 3,
    contractAddress: moonbeamContracts['NestableLootV2'],
    tokenUri: `ipfs://QmTtrvYzqijTUs5b4kdCFzSrBCoydRPQm4gSo8CJomk88e/DFHM8O.json`,
    name: 'Akuban Rod',
    emoteId: '<:akuban_rod:1160348169322901565>'
  },
  'Abyssal Rod': {
    poolId: 0,
    memberId: 4,
    contractAddress: moonbeamContracts['NestableLootV2'],
    tokenUri: `ipfs://QmTtrvYzqijTUs5b4kdCFzSrBCoydRPQm4gSo8CJomk88e/U97CN0.json`,
    name: 'Abyssal Rod',
    emoteId: '<:abyssal_rod:1160348166177181707>'
  },
  'Trakan Tide-Tamer': {
    poolId: 0,
    memberId: 5,
    contractAddress: moonbeamContracts['NestableLootV2'],
    tokenUri: `ipfs://QmTjukF4VKMHkGcgPynxj7EY3haiJRdzuukhUU72YEXSRZ/`,
    name: 'Trakan Tide-Tamer',
    emoteId: '<:trakantidetamer:1189975411824795659>'
  },
  'Wooden Boots': {
    poolId: 0,
    memberId: 6,
    contractAddress: moonbeamContracts['NestableLootV2'],
    tokenUri: `ipfs://Qmdwuf17gx85uEi2RJRqw9uRwpcqPA21NFdmsCfRs8g196/woodenBoots-Alchemist.json`,
    name: 'Wooden Boots',
    emoteId: '<:woodbootsstandalone:1189975416518221884>'
  },
  'Wooden Chest': {
    poolId: 0,
    memberId: 7,
    contractAddress: moonbeamContracts['NestableLootV2'],
    tokenUri: `ipfs://Qmdwuf17gx85uEi2RJRqw9uRwpcqPA21NFdmsCfRs8g196/woodenChest-Alchemist.json`,
    name: 'Wooden Chest',
    emoteId: '<:woodenchest:1189975418791530546>'
  },
  'Wooden Helmet': {
    poolId: 0,
    memberId: 8,
    contractAddress: moonbeamContracts['NestableLootV2'],
    tokenUri: `ipfs://Qmdwuf17gx85uEi2RJRqw9uRwpcqPA21NFdmsCfRs8g196/woodenHelmet-Alchemist.json`,
    name: 'Wooden Helmet',
    emoteId: '<:woodenhelmet:1189975423711445032>'
  },
  'Wooden Grenade': {
    poolId: 0,
    memberId: 9,
    contractAddress: moonbeamContracts['NestableLootV2'],
    tokenUri: `ipfs://Qmdwuf17gx85uEi2RJRqw9uRwpcqPA21NFdmsCfRs8g196/woodenGrenade-Alchemist.json`,
    name: 'Wooden Grenade',
    emoteId: '<:woodengrenade:1189978367504687134>'
  },
  'Wooden Incense': {
    poolId: 0,
    memberId: 10,
    contractAddress: moonbeamContracts['NestableLootV2'],
    tokenUri: `ipfs://Qmdwuf17gx85uEi2RJRqw9uRwpcqPA21NFdmsCfRs8g196/woodenIncense-Alchemist.json`,
    name: 'Wooden Incense',
    emoteId: '<:woodenincense:1189975390786162708>'
  },
  'Wooden Mace': {
    poolId: 0,
    memberId: 11,
    contractAddress: moonbeamContracts['NestableLootV2'],
    tokenUri: `ipfs://Qmdwuf17gx85uEi2RJRqw9uRwpcqPA21NFdmsCfRs8g196/woodenMace-Berserker.json`,
    name: 'Wooden Mace',
    emoteId: '<:woodenmace:1189975393659265064>'
  },
  'Wooden Pouch': {
    poolId: 0,
    memberId: 12,
    contractAddress: moonbeamContracts['NestableLootV2'],
    tokenUri: `ipfs://Qmdwuf17gx85uEi2RJRqw9uRwpcqPA21NFdmsCfRs8g196/woodenPouch-Ranger.json`,
    name: 'Wooden Pouch',
    emoteId: '<:woodenpouch:1189975395504771102>'
  },
  'Wooden Slingshot': {
    poolId: 0,
    memberId: 13,
    contractAddress: moonbeamContracts['NestableLootV2'],
    tokenUri: `ipfs://Qmdwuf17gx85uEi2RJRqw9uRwpcqPA21NFdmsCfRs8g196/woodenSlingshot-Ranger.json`,
    name: 'Wooden Slingshot',
    emoteId: '<:woodenslingshot:1189975397836783616>'
  },
  'Upgraded Wooden Boots': {
    poolId: 0,
    memberId: 14,
    contractAddress: moonbeamContracts['NestableLootV2'],
    tokenUri: `ipfs://Qmdwuf17gx85uEi2RJRqw9uRwpcqPA21NFdmsCfRs8g196/woodenBoots-Alchemist.json`,
    name: 'Upgraded Wooden Boots',
    emoteId: '<:woodbootsstandalone:1189975416518221884>'
  },
  'Upgraded Wooden Chest': {
    poolId: 0,
    memberId: 15,
    contractAddress: moonbeamContracts['NestableLootV2'],
    tokenUri: `ipfs://Qmdwuf17gx85uEi2RJRqw9uRwpcqPA21NFdmsCfRs8g196/woodenChest-Alchemist.json`,
    name: 'Upgraded Wooden Chest',
    emoteId: '<:woodenchest:1189975418791530546>'
  },
  'Upgraded Wooden Helmet': {
    poolId: 0,
    memberId: 16,
    contractAddress: moonbeamContracts['NestableLootV2'],
    tokenUri: `ipfs://Qmdwuf17gx85uEi2RJRqw9uRwpcqPA21NFdmsCfRs8g196/woodenHelmet-Alchemist.json`,
    name: 'Upgraded Wooden Helmet',
    emoteId: '<:woodenhelmet:1189975423711445032>'
  },
  'Upgraded Wooden Grenade': {
    poolId: 0,
    memberId: 17,
    contractAddress: moonbeamContracts['NestableLootV2'],
    tokenUri: `ipfs://Qmdwuf17gx85uEi2RJRqw9uRwpcqPA21NFdmsCfRs8g196/woodenGrenade-Alchemist.json`,
    name: 'Upgraded Wooden Grenade',
    emoteId: '<:woodengrenade:1189978367504687134>'
  },
  'Upgraded Wooden Incense': {
    poolId: 0,
    memberId: 18,
    contractAddress: moonbeamContracts['NestableLootV2'],
    tokenUri: `ipfs://Qmdwuf17gx85uEi2RJRqw9uRwpcqPA21NFdmsCfRs8g196/woodenIncense-Alchemist.json`,
    name: 'Upgraded Wooden Incense',
    emoteId: '<:woodenincense:1189975390786162708>'
  },
  'Upgraded Wooden Mace': {
    poolId: 0,
    memberId: 19,
    contractAddress: moonbeamContracts['NestableLootV2'],
    tokenUri: `ipfs://Qmdwuf17gx85uEi2RJRqw9uRwpcqPA21NFdmsCfRs8g196/woodenMace-Berserker.json`,
    name: 'Upgraded Wooden Mace',
    emoteId: '<:woodenmace:1189975393659265064>'
  },
  'Upgraded Wooden Pouch': {
    poolId: 0,
    memberId: 20,
    contractAddress: moonbeamContracts['NestableLootV2'],
    tokenUri: `ipfs://Qmdwuf17gx85uEi2RJRqw9uRwpcqPA21NFdmsCfRs8g196/woodenPouch-Ranger.json`,
    name: 'Upgraded Wooden Pouch',
    emoteId: '<:woodenpouch:1189975395504771102>'
  },
  'Upgraded Wooden Slingshot': {
    poolId: 0,
    memberId: 21,
    contractAddress: moonbeamContracts['NestableLootV2'],
    tokenUri: `ipfs://Qmdwuf17gx85uEi2RJRqw9uRwpcqPA21NFdmsCfRs8g196/woodenSlingshot-Ranger.json`,
    name: 'Upgraded Wooden Slingshot',
    emoteId: '<:woodenslingshot:1189975397836783616>'
  },
  'Common Pioneer Armor': {
    poolId: 1,
    memberId: 0,
    contractAddress: moonbeamContracts['NestableLootV2'],
    tokenUri: ``,
    name: 'Common Pioneer Armor',
    emoteId: ''
  },
  'Rare Pioneer Armor': {
    poolId: 2,
    memberId: 0,
    contractAddress: moonbeamContracts['NestableLootV2'],
    tokenUri: `ipfs://QmcrsyzF9tJvdhoJCF2Vj8uNGXhf2tiXDGHEQRyP2kGsBV`,
    name: 'Rare Pioneer Armor',
    emoteId: '<:rarepioneerarmor:1189978301456994477>'
  },
  'Epic Pioneer Armor': {
    poolId: 3,
    memberId: 0,
    contractAddress: moonbeamContracts['NestableLootV2'],
    tokenUri: `ipfs://`,
    name: 'Epic Pioneer Armor',
    emoteId: ''
  },
  'Legendary Pioneer Armor': {
    poolId: 4,
    memberId: 0,
    contractAddress: moonbeamContracts['NestableLootV2'],
    tokenUri: 'ipfs://QmRADZYD4bW6GjRp2uxEHGMtfsAbsucRwozm675RZRF1zW',
    name: 'Legendary Pioneer Armor',
    emoteId: '<:legendary_pioneer_armor:1160346048800235581>'
  },
  'Common Pioneer Weapon': {
    poolId: 5,
    memberId: 0,
    contractAddress: moonbeamContracts['NestableLootV2'],
    tokenUri: ``,
    name: 'Common Pioneer Weapon',
    emoteId: ''
  },
  'Rare Pioneer Weapon': {
    poolId: 6,
    memberId: 0,
    contractAddress: moonbeamContracts['NestableLootV2'],
    tokenUri: ``,
    name: 'Rare Pioneer Weapon',
    emoteId: ''
  },
  'Epic Pioneer Weapon': {
    poolId: 7,
    memberId: 0,
    contractAddress: moonbeamContracts['NestableLootV2'],
    tokenUri: `ipfs://QmUkfNcu1JAK3hy7hHHzfQNX3mExSsBMquzGNg6QJqZTe7`,
    name: 'Epic Pioneer Weapon',
    emoteId: '<:epicpioneerweapon:1189978299112374323>'
  },
  'Legendary Pioneer Weapon': {
    poolId: 8,
    memberId: 0,
    contractAddress: moonbeamContracts['NestableLootV2'],
    tokenUri: 'ipfs://QmeFcFA3ZBTwYmUhRFd9w7KkS1EyPbFrnpwKtCqyrDj1Hc',
    name: 'Legendary Pioneer Weapon',
    emoteId: '<:legendary_pioneer_weaponmin:1160369146165465148>'
  },
};

const nftMapping = fillNftMapping()

console.log(nftMapping)

module.exports = {
  nftMapping
}

function fillNftMapping() {
  const nftMapping = {}
  Object.values(itemIds).forEach((item) => {
    let itemId = Number(getItemId(item.poolId, item.memberId));
    nftMapping[`${item.contractAddress.toLowerCase()}+${itemId}`] = {
      itemId: itemId,
      name: item.name,
      metadataUri: item.tokenUri,
      emoteId: item.emoteId
    };
  });
  return nftMapping
}

function getItemId(poolId, memberId) {
  // Combine poolId and memberId into a single uint
  if (poolId > 255 || memberId > 255) {
    throw new Error('poolId or memberId too large');
  }

  let itemId = BigInt(0);
  itemId = (BigInt(poolId) << BigInt(8)) | BigInt(memberId);
  return itemId;
}
