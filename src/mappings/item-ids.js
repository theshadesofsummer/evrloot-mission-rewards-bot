const UNIDENTIFIED_FISH_URI = 'ipfs://QmPfvYzGUjkGydD8fWrTXkb9DcKi3khkikatao5Xme837J/';
const UNIDENTIFIED_ALPHA_URI_COMMONTEST =
  'ipfs://QmNq8puefqR1tpEmKeafJMgGKsCwGWEUDZVmVmcXs3tcfs';
const UNIDENTIFIED_ALPHA_URI_RARETEST =
  'ipfs://QmcZk4udFs3youLppijqQ7cAmYRNzCC55NDhqvcsc3UW7g';
const UNIDENTIFIED_ALPHA_URI_EPICTEST =
  'ipfs://QmShxqtstA14BzGwuE8ywv2kDUM91foNYhRdxdhce5XAcS';
const UNIDENTIFIED_ALPHA_URI_LEGENDARYTEST =
  'ipfs://QmbSFPgaN6sAc9BdTGgcMGzNzY1UbYMthKdzsVJwAGtDdn';
const EVRLOOT_LEGEND_PIONEER_ARMOR = 'ipfs://QmRADZYD4bW6GjRp2uxEHGMtfsAbsucRwozm675RZRF1zW';
const EVRLOOT_LEGEND_PIONEER_WEAPON =
  'ipfs://QmeFcFA3ZBTwYmUhRFd9w7KkS1EyPbFrnpwKtCqyrDj1Hc';

const moonbeamContracts = {
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
  QrngSponsor: '0xA51EA265d3460493738Efc596be7d60106af0DB7', //'0xf04c16d2CE80498507663b63a727163b8121EDE9', //'0xf2cf8c5AD0A7C52e82133518FBdb23d7eA6133A0',
  EvrlootQrng: '0x0d8D79184104831B249b0266A8Dcd0F5E36b04e1', //'0x98fE35199C6480DE507e58202aEEFebc6d219A8c', //'0x9da063e6fC80a1D7F07882ff0A29EE18e6d868fF',
  AirNodeRRP: '0xa0AD79D995DdeeB18a14eAef56A549A04e3Aa1Bd',
  AirNode: '0x9d3C147cA16DB954873A498e0af5852AB39139f2',
  AlphaTest: '0xCD70e6cc957d802Def6de66482f04C76c99E4E61',
  NestableLootV2: '0x2931b4e6E75293f8E94e893ce7BdfAb5521f3fCD',
}

const itemIds = {
  'Common Fish ReqOnly': {
    poolId: 0,
    memberId: 0,
    contractAddress: moonbeamContracts['NestableFish'],
    tokenUri: `${UNIDENTIFIED_FISH_URI}commonFish.json`,
    name: 'Common Fish',
  }, //'COMMON',
  'Common Fish': {
    poolId: 1,
    memberId: 0,
    contractAddress: moonbeamContracts['NestableFish'],
    tokenUri: `${UNIDENTIFIED_FISH_URI}commonFish.json`,
    name: 'Common Fish',
  }, //'COMMON',
  'Rare Fish': {
    poolId: 2,
    memberId: 0,
    contractAddress: moonbeamContracts['NestableFish'],
    tokenUri: `${UNIDENTIFIED_FISH_URI}rareFish.json`,
    name: 'Rare Fish',
  }, //'RARE',
  'Epic Fish': {
    poolId: 3,
    memberId: 0,
    contractAddress: moonbeamContracts['NestableFish'],
    tokenUri: `${UNIDENTIFIED_FISH_URI}epicFish.json`,
    name: 'Epic Fish',
  }, //'EPIC',
  'Legendary Fish': {
    poolId: 4,
    memberId: 0,
    contractAddress: moonbeamContracts['NestableFish'],
    tokenUri: `${UNIDENTIFIED_FISH_URI}legendaryFish.json`,
    name: 'Legendary Fish',
  }, //'LEGENDARY',
  'Common Triumph': {
    poolId: 1,
    memberId: 0,
    contractAddress: moonbeamContracts['AlphaTest'],
    tokenUri: `${UNIDENTIFIED_ALPHA_URI_COMMONTEST}`,
    name: 'Common Triumph',
  }, //'COMMON',
  'Rare Triumph': {
    poolId: 2,
    memberId: 0,
    contractAddress: moonbeamContracts['AlphaTest'],
    tokenUri: `${UNIDENTIFIED_ALPHA_URI_RARETEST}`,
    name: 'Rare Triumph',
  }, //'RARE',
  'Epic Triumph': {
    poolId: 3,
    memberId: 0,
    contractAddress: moonbeamContracts['AlphaTest'],
    tokenUri: `${UNIDENTIFIED_ALPHA_URI_EPICTEST}`,
    name: 'Epic Triumph',
  }, //'EPIC',
  'Legendary Triumph': {
    poolId: 4,
    memberId: 0,
    contractAddress: moonbeamContracts['AlphaTest'],
    tokenUri: `${UNIDENTIFIED_ALPHA_URI_LEGENDARYTEST}`,
    name: 'Legendary Triumph',
  }, //'LEGENDARY',

  'Crafting Item': {
    poolId: 0,
    memberId: 0,
    contractAddress: moonbeamContracts['NestableLoot'],
    tokenUri: ``,
    name: 'Common Item',
  },
  'Makeshift Palm Rod': {
    poolId: 0,
    memberId: 1,
    contractAddress: moonbeamContracts['NestableLoot'],
    tokenUri: `ipfs://QmTtrvYzqijTUs5b4kdCFzSrBCoydRPQm4gSo8CJomk88e/ULOXRD.json`,
    name: 'Makeshift Palm Rod',
  },
  'Reinforced Palm Rod': {
    poolId: 0,
    memberId: 2,
    contractAddress: moonbeamContracts['NestableLoot'],
    tokenUri: `ipfs://QmTtrvYzqijTUs5b4kdCFzSrBCoydRPQm4gSo8CJomk88e/240SHV.json`,
    name: 'Reinforced Palm Rod',
  },
  'Akuban Rod': {
    poolId: 0,
    memberId: 3,
    contractAddress: moonbeamContracts['NestableLoot'],
    tokenUri: `ipfs://QmTtrvYzqijTUs5b4kdCFzSrBCoydRPQm4gSo8CJomk88e/DFHM8O.json`,
    name: 'Akuban Rod',
  },
  'Abyssal Rod': {
    poolId: 0,
    memberId: 4,
    contractAddress: moonbeamContracts['NestableLoot'],
    tokenUri: `ipfs://QmTtrvYzqijTUs5b4kdCFzSrBCoydRPQm4gSo8CJomk88e/U97CN0.json`,
    name: 'Abyssal Rod',
  },
  'Common Pioneer Armor': {
    poolId: 1,
    memberId: 0,
    contractAddress: moonbeamContracts['NestableLoot'],
    tokenUri: ``,
    name: 'Common Pioneer Armor',
  },
  'Rare Pioneer Armor': {
    poolId: 2,
    memberId: 0,
    contractAddress: moonbeamContracts['NestableLoot'],
    tokenUri: ``,
    name: 'Rare Pioneer Armor',
  },
  'Epic Pioneer Armor': {
    poolId: 3,
    memberId: 0,
    contractAddress: moonbeamContracts['NestableLoot'],
    tokenUri: ``,
    name: 'Epic Pioneer Armor',
  },
  'Legendary Pioneer Armor': {
    poolId: 4,
    memberId: 0,
    contractAddress: moonbeamContracts['NestableLoot'],
    tokenUri: EVRLOOT_LEGEND_PIONEER_ARMOR,
    name: 'Legendary Pioneer Armor',
  },
  'Common Pioneer Weapon': {
    poolId: 5,
    memberId: 0,
    contractAddress: moonbeamContracts['NestableLoot'],
    tokenUri: ``,
    name: 'Rare Pioneer Weapon',
  },
  'Rare Pioneer Weapon': {
    poolId: 6,
    memberId: 0,
    contractAddress: moonbeamContracts['NestableLoot'],
    tokenUri: ``,
    name: 'Rare Pioneer Weapon',
  },
  'Epic Pioneer Weapon': {
    poolId: 7,
    memberId: 0,
    contractAddress: moonbeamContracts['NestableLoot'],
    tokenUri: ``,
    name: 'Epic Pioneer Weapon',
  },
  'Legendary Pioneer Weapon': {
    poolId: 8,
    memberId: 0,
    contractAddress: moonbeamContracts['NestableLoot'],
    tokenUri: EVRLOOT_LEGEND_PIONEER_WEAPON,
    name: 'Legendary Pioneer Weapon',
  },
};

const nftMapping = fillNftMapping()

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
