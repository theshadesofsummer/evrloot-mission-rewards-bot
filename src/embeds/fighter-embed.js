module.exports = function createFighterEmbed(userId, souls) {
  const soul = souls[0]
  return {
    color: 0xae1917,
    description: `<@${userId}> is fighting with **${soul.metadata.name}**`,
    thumbnail: {
      url: soul.metadata.image
    },
    fields: [
      {
        name: 'Level',
        value: soul.level,
        inline: true,
      },
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
        name: 'Stats',
        value: statsFormatter(soul),
        inline: true
      },
    ],
  };
}

function statsFormatter(soul) {
  return `*Strength*: ${getStatFormat(soul['Strength'], 8)}\n` +
    `*Dexterity*: ${getStatFormat(soul['Dexterity'], 8)}\n` +
    `*Intelligence*: ${getStatFormat(soul['Intelligence'], 8)}\n` +
    `*Wisdom*: ${getStatFormat(soul['Wisdom'], 8)}\n` +
    `*Fortitude*: ${getStatFormat(soul['Fortitude'], 8)}\n` +
    `*Luck*: ${getStatFormat(soul['Luck'], 4)}`;
}


function getStatFormat(stat, goodValue) {
  return stat >= goodValue ? `**${stat}**` : stat.toString();
}

function formatWeapon(weapon) {
  console.log('weapon', weapon)
  if (!weapon) return '-';


  return `*${weapon.name}*`
}
