const path = require('path');
const fs = require('fs');
const process = require('process');
const PROFILE_PATH = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE || '';
const PASSWORDS_FILE = path.join(PROFILE_PATH, '.credentials', 'vitali.json');

function getCredentials(name) {
  return JSON.parse(fs.readFileSync(PASSWORDS_FILE).toString())
}

module.exports = getCredentials