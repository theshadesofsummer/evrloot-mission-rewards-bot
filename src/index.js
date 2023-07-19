require('dotenv').config();
const { setupDiscordBot } = require("./discord-bot.js");
const web3 = require("./web3.js");
const {decodeInput} = require("./publish-listing");

setupDiscordBot();

web3.eth.subscribe('logs', {
  address: '0xdF5499A17D487345e0201aCE513b26E5F427A717',
  fromBlock: 'latest'
}, function(error, result){
  if (error)
    console.log(error);
  if (!error)
  web3.eth.getTransaction(result.transactionHash).then(async tx => {
    const input = tx.input;
    if (input.startsWith('0xfecb1242')) {
      await decodeInput(input)
    }
  })
})


