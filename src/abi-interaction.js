const web3 = require("./web3");
const { missionReward } = require("./mission-interaction");

module.exports = {
  setupAuctionListener,
  getMissionInformation
}

const ABI_EVRLOOT_BOUND = require('./abi/ABI_EVRLOOT_BOUND.json');
const CONTRACT_ADDRESS_EVRLOOT_BOUND = '0xba6bd2Aace40c9a14c4123717119a80e9fe6738A';
const EVRLOOT_BOUND = new web3.eth.Contract(ABI_EVRLOOT_BOUND, CONTRACT_ADDRESS_EVRLOOT_BOUND);

function setupAuctionListener() {
  EVRLOOT_BOUND.events.MissionReward(() => {
  }).on("connected", function (_subscriptionId) {
    console.log('connected to mission reward event!');
  })
    .on('data', function (event) {
      missionReward(event)
    })
    .on('error', function (error, receipt) {
      console.log('Error:', error, receipt);
    });
}

async function getMissionInformation(missionId) {
  return await EVRLOOT_BOUND.methods.getMissionData(missionId).call();
}