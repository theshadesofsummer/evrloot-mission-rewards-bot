const braillePatternBlank = '⠀'

module.exports = function createOpenFightsEmbed(receivedInvitations, sendInvitationsWithoutSoul, sendInvitationsWithSoul) {
  const highestLength = Math.max(receivedInvitations.length, sendInvitationsWithoutSoul.length, sendInvitationsWithSoul.length)
  return {
    color: 0xae1917,
    title: `Overview of your fights!`,
    fields: [
      {
        name: 'Received Invitations from:',
        value: listReceivedInvitations(receivedInvitations, highestLength),
        inline: true
      },
      {
        name: 'Send Invitations (without a soul):',
        value: listSendInvitationsWithoutSoul(sendInvitationsWithoutSoul, highestLength),
        inline: true
      },
      {
        name: 'Send Invitations (with a soul):',
        value: listSendInvitationsWithSoul(sendInvitationsWithSoul, highestLength),
        inline: true
      }
    ],
    timestamp: new Date().toISOString(),
  };
}

function listReceivedInvitations(receivedInvitations, highestLength) {
  if (receivedInvitations.length <= 0)
    return addMissingRows(highestLength - receivedInvitations.length)
      + '\n*No incoming invitations!*'

  let result = '';
  receivedInvitations.forEach(invitation => result += `from: <@${invitation.fighterA}>\n`)

  result += addMissingRows(highestLength - receivedInvitations.length)
    + '\n*Accept any of these invites with `/fight accept`!*'

  return result
}

function listSendInvitationsWithoutSoul(sendInvitationsWithoutSoul, highestLength) {
  if (sendInvitationsWithoutSoul.length <= 0)
    return addMissingRows(highestLength - sendInvitationsWithoutSoul.length)
      + '\n*You have no pending invitations without a fighter!\nInvite someone with `/fight invite`!*'

  let result = '';
  sendInvitationsWithoutSoul.forEach(invitation => result += `to: <@${invitation.fighterB}>\n`)

  result += addMissingRows(highestLength - sendInvitationsWithoutSoul.length)
    + '\n*Supply a fighter to your invitations with `/fight invite`!*'

  return result
}

function listSendInvitationsWithSoul(sendInvitationsWithSoul, highestLength) {
  if (sendInvitationsWithSoul.length <= 0)
    return addMissingRows(highestLength - sendInvitationsWithSoul.length)
      + '\n*You have no pending invitations with a fighter!\nInvite someone with `/fight invite`!*'

  let result = '';
  sendInvitationsWithSoul.forEach(invitation => result += `to: <@${invitation.fighterB}>\n`)

  result += addMissingRows(highestLength - sendInvitationsWithSoul.length)
    + '\n*Wait for your opponent to accept the fight!*'

  return result
}

function addMissingRows(remainingSpace) {
  let result = ''
  for (let i = 0; i < remainingSpace; i++) {
    result += braillePatternBlank + '\n'
  }
  return result
}