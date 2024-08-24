const {ButtonBuilder, ButtonStyle, ActionRowBuilder} = require("discord.js");
const {updateDocument, deleteWallet} = require("../evrloot-db");

module.exports = {
  verificationMessage
}

async function verificationMessage(member, wallet) {
  console.log('[DM]', 'initiating the verification process for', member, 'with address', wallet);
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

    console.log('[DM]', 'successfully created DM');

    const confirmationDm = await member.send({
      content: dmMessage,
      components: [row],
    })

    console.log('[DM]', 'successfully sent 1st message');

    try {
      const confirmation = await confirmationDm.awaitMessageComponent({time: 60_000});

      await handleVerificationConfirmation(confirmation, member, wallet)
    } catch (e) {
      console.log('[DM]', 'user did not react or some error happened:', e)
      await deleteWallet(wallet)
      await confirmationDm.edit({
        components: []
      })
      await member.send({
        content: `Not the most talkative, are you traveller? Do not worry, i'll just throw the paper into the well.\n` +
          `> *Since you did not respond in 60s your entry was not saved. For another try please put in your discord username on the website https://game.evrloot.com/*`,
        components: []
      });
    }

  } catch (e) {
    console.log('dm create error:', e)
    await deleteWallet(wallet)
    console.log('could not create DM for', member.user.username)
  }
}

async function handleVerificationConfirmation(confirmation, member, wallet) {
  if (confirmation.customId === 'confirm') {
    console.log('[DM]', 'user confirmed verification')
    await updateDocument({wallet}, {verified: true, isAnonymous: true, discordId: member.id})

    await confirmation.update({components: []});

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
      content: `Thanks, i knew you i could count on you!\nI will keep this note stored safe!\n\n` +
        `Do you want your name to be publicly shown?`,
      components: [rowAnon]
    })
    console.log('[DM]', 'sent user anon message')

    try {
      const confirmation = await requestAnonMessage.awaitMessageComponent({time: 60_000});

      await handleAnonConfirmation(confirmation, member, wallet)
    } catch (e) {
      console.log('[DM]', 'user did not react on the anon request or some error happened:', e)
      await requestAnonMessage.edit({
        components: []
      })
      await member.send({
        content: `Alright, if you stay that silent i will take that as a no.\n` +
          `> *Since you did not respond in 60s you are automatically the status 'anonymous'. Your entry was saved successfully, check your accounts with \`/connected-wallets\`*`,
        components: []
      });
    }

  } else if (confirmation.customId === 'deny') {
    console.log('[DM]', 'user denied verification')
    await deleteWallet(wallet)
    await confirmation.update({components: []});
    await member.send(`Of course, this looked like total gibberish. I'm sorry for wasting your time, traveller!`)
  }
}

async function handleAnonConfirmation(confirmation, member, wallet) {
  if (confirmation.customId === 'confirm-anon') {
    console.log('[DM]', 'user accepted being shown')
    await updateDocument({wallet}, {isAnonymous: false})

    await confirmation.update({components: []});
    await member.send(`Perfect, if you find something valuable i will spread the news!\n` +
      `> *Successfully connected your account. You can always check your connected accounts with \`/connected-wallets\`*`)
  } else if (confirmation.customId === 'deny-anon') {
    console.log('[DM]', 'user denied being shown')
    await confirmation.update({components: []});
    await member.send(`Alright, i will respect the mystery, thanks a lot!\n` +
      `> *Successfully connected your account. You can always check your connected accounts with \`/connected-wallets\`*`)
  }
}
