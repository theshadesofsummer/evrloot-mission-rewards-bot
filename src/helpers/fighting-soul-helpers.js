const {getOutstandingInvitationWithSoul, getSoulCooldown} = require("../evrloot-db");

module.exports = {
  mapStatusToSoul,
  isSoulAvailable,
  soulSorterByStatus
}

function mapStatusToSoul(soulList) {
  return Promise.all(soulList.map(enrichSoulWithStatus));
}

async function enrichSoulWithStatus(soul) {
  const outstandingFight = await getOutstandingInvitationWithSoul(soul.id)
  if (outstandingFight) {
    return {...soul, status: 'waitingForFight', opponent: outstandingFight.fighterB}
  }

  const soulCooldown = await getSoulCooldown(soul.id)
  if (soulCooldown) {
    return {...soul, status: 'onCooldown', cooldown: soulCooldown.cooldownUntil}
  } else {
    return {...soul, status: 'readyForFight'}
  }
}

async function isSoulAvailable(soulId) {
  const outstandingFight = await getOutstandingInvitationWithSoul(soulId)
  const soulCooldown = await getSoulCooldown(soulId)

  return !outstandingFight && !soulCooldown
}

function soulSorterByStatus(soulA, soulB) { // 1 -> soulB switches to front; -1 soulA goes back
  const soulAStatus = soulA.status;
  const soulBStatus = soulB.status;

  if (soulBStatus === 'readyForFight' && soulAStatus === 'readyForFight'
    || soulBStatus === 'waitingForFight' && soulAStatus === 'waitingForFight') {
    return 0
  } else if (soulBStatus === 'readyForFight') {
    return 1
  } else if (soulBStatus === 'waitingForFight' && soulAStatus === 'onCooldown') {
    return 1;
  } else if (soulBStatus === 'waitingForFight' && soulAStatus === 'readyForFight') {
    return -1;
  } else if (soulBStatus === 'onCooldown' && soulAStatus === 'readyForFight') {
    return -1;
  } else if (soulBStatus === 'onCooldown' && soulAStatus === 'waitingForFight') {
    return -1;
  } else if (soulBStatus === 'onCooldown' && soulAStatus === 'onCooldown') {
    return soulA.cooldown - soulB.cooldown;
  }
  return 0
}

// async function filterAsync(array, callbackfn) {
//   const filterMap = await mapAsync(array, callbackfn);
//   return array.filter((value, index) => filterMap[index]);
// }
//