const Web3 = require('web3');
// Moonbeam official public WebSocket RPC: https://docs.moonbeam.network/builders/get-started/endpoints/
module.exports = new Web3(
  new Web3.providers.WebsocketProvider('wss://wss.api.moonbeam.network', {
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
