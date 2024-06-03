var path = require('path');

var PROFILE_PATH = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
var PROJECT_PATH = path.join(PROFILE_PATH, 'Documents/Collections/vitali/LinkedIn');

var TOKEN_DIR = path.join(process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE, '.credentials');
var SESSIONS_PATH = path.join(TOKEN_DIR, 'sessions.json');

module.exports = {
  SESSIONS_PATH,
  PROJECT_PATH
}