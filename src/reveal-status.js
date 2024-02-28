const fs = require("fs");
let revealStatus = {}

module.exports = {
  loadRevealStatus,
  getRevealStatus,
  addRevealDay,
  addDiscoveredUser
}

function loadRevealStatus() {
  revealStatus = JSON.parse(fs.readFileSync('reveal-status.json', 'utf8'))
}

function getRevealStatus() {
  return revealStatus
}

function saveRevealStatus() {
  fs.writeFileSync('reveal-status.json', JSON.stringify(revealStatus) , 'utf-8');
}

function addRevealDay(day) {
  console.log('[REVEAL]', 'try to add day', day, 'to days revealed')
  revealStatus.daysRevealed.push(day)
  saveRevealStatus()
}

function addDiscoveredUser(recipeName, userId) {
  console.log('[REVEAL]', 'try to add userId', userId, 'to recipe', recipeName)
  const potion = revealStatus.potions.find(recipe => recipe.name.localeCompare(recipeName) === 0)
  if (potion) {
    potion.discoveredBy = userId;
  }
  const tincture = revealStatus.tinctures.find(recipe => recipe.name.localeCompare(recipeName) === 0)
  if (tincture) {
    tincture.discoveredBy = userId;
  }
  saveRevealStatus();
}