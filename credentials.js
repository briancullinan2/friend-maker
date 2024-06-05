const path = require('path');
const fs = require('fs');
const {PASSWORDS_FILE} = require('./config.js');

function getCredentials(name) {
  return JSON.parse(fs.readFileSync(PASSWORDS_FILE).toString())
}

module.exports = getCredentials