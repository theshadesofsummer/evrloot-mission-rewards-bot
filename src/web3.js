const Web3 = require('web3');

module.exports = new Web3(
  new Web3.providers.WebsocketProvider('wss://moonbeam.blastapi.io/3f7856cf-73cf-489e-9973-0daafbd333a6', {
    clientConfig: {
      keepalive: true,
      keepaliveInterval: 60000,
    },
    reconnect: {
      auto: true,
      delay: 2500,
      onTimeout: true,
    },
  })
);
