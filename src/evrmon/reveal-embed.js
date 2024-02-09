const {getUserByClientId} = require("../discord-client");

module.exports = async function createEvrmonRevealEmbed(evrmon) {
  const user = await getUserByClientId(evrmon.id)

  return {
    color: 0x7532a8,
    author: {
      iconURL: user.avatarURL(),
      name: user.globalName
    },
    title: `A wild Evrmon has appeared!`,
    description: 'You suddenly hear leaves shuffeling behind you. As you turn around, you spot a little creature glazing upon you with its precious eyes. ' +
      'You sense a small bond forming between the two of you as you take a closer look at it.',
    fields: [
      {
        name: 'Stats',
        value: statsFormatter(evrmon),
        inline: true
      },
      {
        name: 'Main Hand',
        value: formatWeapon(evrmon.mainHandWeapon),
        inline: true,
      }
    ],
  };
}

function statsFormatter() {
  return `💪🏼 *Strength*: <a:dice:1202953142338326549> Being Randomized... <a:dice:1202953142338326549>\n` +
    `🪶 *Dexterity*: <a:dice:1202953142338326549> Being Randomized... <a:dice:1202953142338326549>\n` +
    `🧠 *Intelligence*: <a:dice:1202953142338326549> Being Randomized... <a:dice:1202953142338326549>\n` +
    `🗺️ *Wisdom*: <a:dice:1202953142338326549> Being Randomized... <a:dice:1202953142338326549>\n` +
    `⚔️ *Fortitude*: <a:dice:1202953142338326549> Being Randomized... <a:dice:1202953142338326549>\n` +
    `🍀 *Luck*: <a:dice:1202953142338326549> Being Randomized... <a:dice:1202953142338326549>\n` +
    `🛡️ *Armor*: <a:dice:1202953142338326549> Being Randomized... <a:dice:1202953142338326549>`;
}

function formatWeapon(weapon) {
  if (!weapon) return '-';

  let weaponDisplay = `*${weapon.name}* (${weapon.properties['Rarity'].value})\n`

  if (weapon.properties['MinDamage'] && weapon.properties['MaxDamage'])
    weaponDisplay += `Damage: ${weapon.properties['MinDamage'].value}-${weapon.properties['MaxDamage'].value}`

  if (weapon.properties['Min Damage'] && weapon.properties['Max Damage'])
    weaponDisplay += `Damage: ${weapon.properties['Min Damage'].value}-${weapon.properties['Max Damage'].value}`

  return weaponDisplay
}
