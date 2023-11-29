module.exports = {
  findValueForAttribute
}

function findValueForAttribute(attributes, label) {
  return attributes.find(attribute => attribute.label === label).value;
}