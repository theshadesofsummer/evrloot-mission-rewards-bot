const {ButtonBuilder, ButtonStyle, ActionRowBuilder} = require("discord.js");
const {updateDocument, deleteWallet} = require("../evrloot-db");

module.exports = {
  verificationMessage
}

async function verificationMessage(client, member, wallet) {
  console.log('[DM]', 'initiating the verification process for', member.user.username, 'with address', wallet);
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
      const confirmation = await confirmationDm.awaitMessageComponent({time: 6_000});

      await handleVerificationConfirmation(client, confirmation, member, wallet)
    } catch (e) {
      console.log(e)

      await logMessageOrErrorForVerification(client, 'user', member.user.username, 'did not react within 60s on the verification message, deleting entry and removing buttons;', e)
      await deleteWallet(wallet)
      await confirmationDm.edit({
        components: []
      })
      await member.send({
        content: `Not the most talkative, are you traveller? Do not worry, i'll just throw the paper into the well.\n` +
          `> *Since you did not respond in 60s your entry was not saved. For another try please put in your discord username on the website again*`,
        components: []
      });
    }

  } catch (e) {
    console.log('x')
    await logMessageOrErrorForVerification(client, 'could not create DM for', member.user.username, 'therefore deleting entry', e)
    await deleteWallet(wallet)
  }
}

async function handleVerificationConfirmation(client, confirmation, member, wallet) {
  if (confirmation.customId === 'confirm') {
    await logMessageOrErrorForVerification(client, 'user', member.user.username, 'confirmed verification')

    await updateDocument({wallet}, {verified: true, discordId: member.id})

    await confirmation.update({components: []});

    await member.send({
      content: `Thanks, i knew you i could count on you!\nI will keep this note stored safe!\n`
    })

  } else if (confirmation.customId === 'deny') {
    await logMessageOrErrorForVerification(client, 'user', member.user.username, 'denied verification, deleting entry')
    await deleteWallet(wallet)
    await confirmation.update({components: []});
    await member.send(`Of course, this looked like total gibberish. I'm sorry for wasting your time, traveller!`)
  }
}

