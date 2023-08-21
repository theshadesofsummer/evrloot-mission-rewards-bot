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

const itemIds = {
  'Common Fish ReqOnly': {
    poolId: 0,
    memberId: 0,
    contractAddress: '0x95492edcc1d373e236e368973285ad47d56d07b6',
    tokenUri: `${UNIDENTIFIED_FISH_URI}commonFish.json`,
    name: 'Common Fish',
  }, //'COMMON',
  'Common Fish': {
    poolId: 1,
    memberId: 0,
    contractAddress: '0x95492edcc1d373e236e368973285ad47d56d07b6',
    tokenUri: `${UNIDENTIFIED_FISH_URI}commonFish.json`,
    name: 'Common Fish',
  }, //'COMMON',
  'Rare Fish': {
    poolId: 2,
    memberId: 0,
    contractAddress: '0x95492edcc1d373e236e368973285ad47d56d07b6',
    tokenUri: `${UNIDENTIFIED_FISH_URI}rareFish.json`,
    name: 'Rare Fish',
  }, //'RARE',
  'Epic Fish': {
    poolId: 3,
    memberId: 0,
    contractAddress: '0x95492edcc1d373e236e368973285ad47d56d07b6',
    tokenUri: `${UNIDENTIFIED_FISH_URI}epicFish.json`,
    name: 'Epic Fish',
  }, //'EPIC',
  'Legendary Fish': {
    poolId: 4,
    memberId: 0,
    contractAddress: '0x95492edcc1d373e236e368973285ad47d56d07b6',
    tokenUri: `${UNIDENTIFIED_FISH_URI}legendaryFish.json`,
    name: 'Legendary Fish',
  }, //'LEGENDARY',
  'Common Triumph': {
    poolId: 1,
    memberId: 0,
    contractAddress: '0xCD70e6cc957d802Def6de66482f04C76c99E4E61',
    tokenUri: `${UNIDENTIFIED_ALPHA_URI_COMMONTEST}`,
    name: 'Common Triumph',
  }, //'COMMON',
  'Rare Triumph': {
    poolId: 2,
    memberId: 0,
    contractAddress: '0xCD70e6cc957d802Def6de66482f04C76c99E4E61',
    tokenUri: `${UNIDENTIFIED_ALPHA_URI_RARETEST}`,
    name: 'Rare Triumph',
  }, //'RARE',
  'Epic Triumph': {
    poolId: 3,
    memberId: 0,
    contractAddress: '0xCD70e6cc957d802Def6de66482f04C76c99E4E61',
    tokenUri: `${UNIDENTIFIED_ALPHA_URI_EPICTEST}`,
    name: 'Epic Triumph',
  }, //'EPIC',
  'Legendary Triumph': {
    poolId: 4,
    memberId: 0,
    contractAddress: '0xCD70e6cc957d802Def6de66482f04C76c99E4E61',
    tokenUri: `${UNIDENTIFIED_ALPHA_URI_LEGENDARYTEST}`,
    name: 'Legendary Triumph',
  }, //'LEGENDARY',
  'Crafting Item': {
    poolId: 0,
    memberId: 0,
    contractAddress: '0x29b58A7fCeecF0C84e62301E5b933416a1DB0599',
    tokenUri: ``,
    name: 'Common Item',
  },
  'Makeshift Palm Rod': {
    poolId: 0,
    memberId: 1,
    contractAddress: '0x29b58A7fCeecF0C84e62301E5b933416a1DB0599',
    tokenUri: `ipfs://QmTtrvYzqijTUs5b4kdCFzSrBCoydRPQm4gSo8CJomk88e/ULOXRD.json`,
    name: 'Makeshift Palm Rod',
  },
  'Reinforced Palm Rod': {
    poolId: 0,
    memberId: 2,
    contractAddress: '0x29b58A7fCeecF0C84e62301E5b933416a1DB0599',
    tokenUri: `ipfs://QmTtrvYzqijTUs5b4kdCFzSrBCoydRPQm4gSo8CJomk88e/240SHV.json`,
    name: 'Reinforced Palm Rod',
  },
  'Akuban Rod': {
    poolId: 0,
    memberId: 3,
    contractAddress: '0x29b58A7fCeecF0C84e62301E5b933416a1DB0599',
    tokenUri: `ipfs://QmTtrvYzqijTUs5b4kdCFzSrBCoydRPQm4gSo8CJomk88e/DFHM8O.json`,
    name: 'Akuban Rod',
  },
  'Abyssal Rod': {
    poolId: 0,
    memberId: 4,
    contractAddress: '0x29b58A7fCeecF0C84e62301E5b933416a1DB0599',
    tokenUri: `ipfs://QmTtrvYzqijTUs5b4kdCFzSrBCoydRPQm4gSo8CJomk88e/U97CN0.json`,
    name: 'Abyssal Rod',
  },
  'Common Pioneer Armor': {
    poolId: 1,
    memberId: 0,
    contractAddress: '0x29b58A7fCeecF0C84e62301E5b933416a1DB0599',
    tokenUri: ``,
    name: 'Common Pioneer Armor',
  },
  'Rare Pioneer Armor': {
    poolId: 2,
    memberId: 0,
    contractAddress: '0x29b58A7fCeecF0C84e62301E5b933416a1DB0599',
    tokenUri: ``,
    name: 'Rare Pioneer Armor',
  },
  'Epic Pioneer Armor': {
    poolId: 3,
    memberId: 0,
    contractAddress: '0x29b58A7fCeecF0C84e62301E5b933416a1DB0599',
    tokenUri: ``,
    name: 'Epic Pioneer Armor',
  },
  'Legendary Pioneer Armor': {
    poolId: 4,
    memberId: 0,
    contractAddress: '0x29b58A7fCeecF0C84e62301E5b933416a1DB0599',
    tokenUri: EVRLOOT_LEGEND_PIONEER_ARMOR,
    name: 'Legendary Pioneer Armor',
  },
  'Common Pioneer Weapon': {
    poolId: 5,
    memberId: 0,
    contractAddress: '0x29b58A7fCeecF0C84e62301E5b933416a1DB0599',
    tokenUri: ``,
    name: 'Rare Pioneer Weapon',
  },
  'Rare Pioneer Weapon': {
    poolId: 6,
    memberId: 0,
    contractAddress: '0x29b58A7fCeecF0C84e62301E5b933416a1DB0599',
    tokenUri: ``,
    name: 'Rare Pioneer Weapon',
  },
  'Epic Pioneer Weapon': {
    poolId: 7,
    memberId: 0,
    contractAddress: '0x29b58A7fCeecF0C84e62301E5b933416a1DB0599',
    tokenUri: ``,
    name: 'Epic Pioneer Weapon',
  },
  'Legendary Pioneer Weapon': {
    poolId: 8,
    memberId: 0,
    contractAddress: '0x29b58A7fCeecF0C84e62301E5b933416a1DB0599',
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
    nftMapping[`${item.contractAddress}+${itemId}`] = {
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
