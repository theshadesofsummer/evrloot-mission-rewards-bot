const {ButtonBuilder, ButtonStyle, ActionRowBuilder} = require("discord.js");
const {updateDocument, deleteWallet} = require("../evrloot-db");

module.exports = {
  verificationMessage
}
async function verificationMessage(member, wallet) {
  const dmMessage = `Welcome Traveller, i found a ripped piece of paper in the palace, it recited your name and the following combination i can't seem to make sense of...\n` +
    `It stated: \`${wallet}\`\n` +
    `Can you make sense of this?`;

  const confirm = new ButtonBuilder()
    .setCustomId('confirm')
    .setLabel('Yes, i recall this combination!')
    .setStyle(ButtonStyle.Success);

  const deny = new ButtonBuilder()
    .setCustomId('deny')
    .setLabel('No, i have never seen that!')
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder()
    .addComponents(deny, confirm);

  try {
    await member.createDM()

    const confirmationDm = await member.send({
      content: dmMessage,
      components: [row],
    })

    try {
      const confirmation = await confirmationDm.awaitMessageComponent({ time: 60_000 });

      await handleVerificationConfirmation(confirmation, member, wallet)
    } catch (e) {
      console.log('user did not react or some error happened:', e)
      await deleteWallet(wallet)
      await member.send({ content: `Not the most talkative, are you traveller? Do not worry, i'll just throw the paper into the well.`, components: [] });
    }

  } catch (e) {
    await deleteWallet(wallet)
    console.log('could not create DM for', member.user.username)
  }
}

async function handleVerificationConfirmation(confirmation, member, wallet) {
  if (confirmation.customId === 'confirm') {
    await updateDocument({wallet}, {verified: true, isAnonymous: true})

    await confirmation.update({ components: [] });

    const confirmAnon = new ButtonBuilder()
      .setCustomId('confirm-anon')
      .setLabel('Yes i want my name to be publicly shown!')
      .setStyle(ButtonStyle.Success);

    const denyAnon = new ButtonBuilder()
      .setCustomId('deny-anon')
      .setLabel('No thanks, i rather want to stay undercover!')
      .setStyle(ButtonStyle.Danger);

    const rowAnon = new ActionRowBuilder()
      .addComponents(denyAnon, confirmAnon);

    const requestAnonMessage = await member.send({
      content: `Thanks, i knew you i could count on you!\nI will keep this note stored safe!`,
      components: [rowAnon]
    })

    try {
      const confirmation = await requestAnonMessage.awaitMessageComponent({ time: 60_000 });

      await handleAnonConfirmation(confirmation, member, wallet)
    } catch (e) {
      console.log('user did not react on the anon request or some error happened:', e)
      await member.send({ content: `Alright, if you stay that silent i will take that as a no.`, components: [] });
    }

  } else if (confirmation.customId === 'deny') {
    await deleteWallet(wallet)
    await confirmation.update({ components: [] });
    await member.send(`Of course, this looked like total gibberish. I'm sorry for wasting your time, traveller!`)
  }
}

async function handleAnonConfirmation(confirmation, member, wallet) {
  if (confirmation.customId === 'confirm-anon') {
    await updateDocument({wallet}, {isAnonymous: false})

    await confirmation.update({ components: [] });
    await member.send(`Perfect, if you something valuable i will spread the news!`)
  } else if (confirmation.customId === 'deny-anon') {
    await confirmation.update({ components: [] });
    await member.send(`Alright, i will respect the mystery, thanks a lot!`)
  }
}