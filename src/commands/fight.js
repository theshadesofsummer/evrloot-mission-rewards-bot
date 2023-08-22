const {SlashCommandBuilder} = require("discord.js");
const {getConnectedWallets, createNewFight, getRunningFight} = require("../evrloot-db");
const {getOnlySouls} = require("../evrloot-api");
const {createChooseSoulEmbeds} = require("../embeds/choose-soul-embeds");
const {Pagination, ExtraRowPosition} = require("pagination.djs");
const {createSelectMenuRow} = require("../helpers/select-menu");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fight')
    .setDescription('Pick one of your souls to fight against your friends or (soon to be) enemies!')
    .addSubcommand(subcommand =>
      subcommand.setName('invite')
        .setDescription('Start a challenge and wait for your opponent to accept or refuse.')
        .addUserOption(option =>
          option.setName('opponent')
            .setDescription('Your counterpart on the battlefield')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand.setName('accept')
        .setDescription('tbd!')
    ),
  async execute(interaction) {
    await interaction.deferReply({
      ephemeral: true
    })

    const username = interaction.user.username
    const wallets = await getConnectedWallets({discordId: username})

    if (!wallets || wallets.length <= 0) {
      await interaction.editReply({
        content: `To have access to your souls you need to connect your wallet(s) to your discord account!`
      })
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'invite') {
      let opponent = interaction.options.getUser('opponent');

      let fightId;
      const runningFight = await getRunningFight(interaction.user.username, opponent.username)
      if (runningFight === null) {
        console.log('need to create a new fight')
        const insertResult = await createNewFight(interaction.user.username, opponent.username)
        fightId = insertResult.insertedId
      } else {
        console.log('running fight found')
        fightId = runningFight._id
      }


      const allAccountsWithSouls = wallets.map(getOnlySouls)
      Promise.all(allAccountsWithSouls).then(async soulsInAllAccounts => {
        const soulList = soulsInAllAccounts.flat();

        const embeds = createChooseSoulEmbeds(soulList);

        const pagination = new Pagination(interaction)
          .setEmbeds(embeds)
          .setEphemeral(true)
          .addActionRows([createSelectMenuRow(soulList, 'choose-fight-menu', fightId)], ExtraRowPosition.Below);

        await pagination.render();
      })
    }
  },
};

