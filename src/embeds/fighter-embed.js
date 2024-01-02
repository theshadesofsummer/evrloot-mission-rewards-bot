const {getUserByClientId} = require("../discord-client");
module.exports = async function createFighterEmbed(soul) {
  const user = await getUserByClientId(soul.discordId)

  return {
    color: 0xae1917,
    author: {
      iconURL: user.avatarURL(),
      name: user.globalName
    },
    title: `**${soul.metadata.name}**`,
    thumbnail: {
      url: soul.metadata.image
    },
    fields: [
      {
        name: 'Main Hand',
        value: formatWeapon(soul.mainHandWeapon),
        inline: true,
      },
      {
        name: 'Off Hand',
        value: formatWeapon(soul.offHandWeapon),
        inline: true,
      },
      {
        name: 'Armor',
        value: formatArmor(soul.nft.children),
        inline: true,
      },
      {
        name: 'Stats',
        value: statsFormatter(soul),
        inline: true
      },
      {
        name: 'Other Equipment',
        value: formatOtherEquipment(soul.nft.children),
        inline: true
      },
    ],
  };
}

function statsFormatter(soul) {
  return `*Strength*: ${getStatFormat(soul['Strength'], 8)} ${upgradedStat(soul.nft.children, 'Strength')}\n` +
    `*Dexterity*: ${getStatFormat(soul['Dexterity'], 8)} ${upgradedStat(soul.nft.children, 'Dexterity')}\n` +
    `*Intelligence*: ${getStatFormat(soul['Intelligence'], 8)} ${upgradedStat(soul.nft.children, 'Intelligence')}\n` +
    `*Wisdom*: ${getStatFormat(soul['Wisdom'], 8)} ${upgradedStat(soul.nft.children, 'Wisdom')}\n` +
    `*Fortitude*: ${getStatFormat(soul['Fortitude'], 8)} ${upgradedStat(soul.nft.children, 'Fortitude')}\n` +
    `*Luck*: ${getStatFormat(soul['Luck'], 4)} ${upgradedStat(soul.nft.children, 'Luck')}`;
}

function upgradedStat(soulChildren, statType) {
  const effectingChildNfts = soulChildren
    .filter(childNft => childNft.retrievedMetadata.properties[statType])

  if (effectingChildNfts.length < 1) return ""

  const upgradeAmount = effectingChildNfts.reduce((acc, childNft) => acc + Number(childNft.retrievedMetadata.properties[statType].value), 0)
  return `***+${upgradeAmount}***`;
}

function getStatFormat(stat, goodValue) {
  return stat >= goodValue ? `**${stat}**` : stat.toString();
}

function formatWeapon(weapon) {
  if (!weapon) return '-';

  let weaponDisplay = `*${weapon.name}* (${weapon.properties['Rarity'].value})\n`

  if (weapon.properties['MinDamage'] && weapon.properties['MaxDamage'])
    weaponDisplay += `Damage: ${weapon.properties['MinDamage'].value}-${weapon.properties['MaxDamage'].value}`

  return weaponDisplay
}

function formatArmor(childNfts) {
  let result = '';

  const head = findSlot(childNfts, "Head");
  if (head) result += writeArmorStats(head)

  const body = findSlot(childNfts, "Body");
  if (body) result += writeArmorStats(body)

  const feet = findSlot(childNfts, "Feet");
  if (feet) result += writeArmorStats(feet)

  return result;
}

function formatOtherEquipment(childNfts) {
  let result = '';

  const neck = findSlot(childNfts, "Neck");
  if (neck) result += writeNormalChildNft(neck)

  const ringMainHand = findSlot(childNfts, "Ring Main Hand");
  if (ringMainHand) result += writeNormalChildNft(ringMainHand)

  const ringOffHand = findSlot(childNfts, "Ring Off Hand");
  if (ringOffHand) result += writeNormalChildNft(ringOffHand)

  return result;
}

function findSlot(childNfts, slotName) {
  return childNfts.find(childNft => childNft.retrievedMetadata.properties["Slot"].value === slotName)
}

function writeArmorStats(childNft) {
  let text = writeNormalChildNft(childNft)`*${childNft.retrievedMetadata.properties["Slot"].value}*: (${childNft.retrievedMetadata.properties["Rarity"].value}) ${childNft.retrievedMetadata.name} +${childNft.retrievedMetadata.properties["Armor"].value}🛡️\n`
  if (childNft.retrievedMetadata.properties["Armor"]) text += ` +${childNft.retrievedMetadata.properties["Armor"].value}🛡️\n`
  return text;
}

function writeNormalChildNft(neckNft) {
  return `*${neckNft.retrievedMetadata.properties["Slot"].value}*: (${neckNft.retrievedMetadata.properties["Rarity"].value}) ${neckNft.retrievedMetadata.name}\n`
}

