const path = require('path');
const process = require('process');

const PROFILE_PATH = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
const PROJECT_PATH = path.join(PROFILE_PATH, 'Documents/Collections/vitali/LinkedIn');
const FACEBOOK_PATH = path.join(PROFILE_PATH, 'Documents/Collections/vitali/Facebook');

const TOKEN_DIR = path.join(PROFILE_PATH, '.credentials');
const SESSIONS_PATH = path.join(TOKEN_DIR, 'sessions.json');

const PASSWORDS_FILE = path.join(PROFILE_PATH, '.credentials', 'vitali.json');

const OPENAI_AUTH = path.join(PROFILE_PATH, '.credentials', 'openai.json');

module.exports = {
  SESSIONS_PATH,
  PROJECT_PATH,
  PASSWORDS_FILE,
  OPENAI_AUTH,
  FACEBOOK_PATH
}