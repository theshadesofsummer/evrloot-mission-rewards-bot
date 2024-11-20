const {ethers} = require("ethers");
const {logMessageOrError} = require("./discord-client");

const provider = new ethers.WebSocketProvider('wss://moonbeam.blastapi.io/3f7856cf-73cf-489e-9973-0daafbd333a6');

module.exports = provider

provider.on('error', (error) => {
  console.error('WebSocket provider error:', error);
  logMessageOrError('WebSocket provider error:', error)
});
