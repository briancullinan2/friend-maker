var fs = require('fs');
var path = require('path');
const { WebDriver, Capabilities, Session } = require('selenium-webdriver')
const _http = require('selenium-webdriver/http');
const chrome = require('selenium-webdriver/chrome');

var TOKEN_DIR = path.join(process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE, '.credentials');
var SESSIONS_PATH = path.join(TOKEN_DIR, 'sessions.json');

var sessions = [];
var sessionModified = 0;

function readSessions() {
    try {
        if(fs.existsSync(SESSIONS_PATH)
           && fs.statSync(SESSIONS_PATH).mtime.getTime() > sessionModified) {
            sessionModified = fs.statSync(SESSIONS_PATH).mtime.getTime();
            sessions = JSON.parse(fs.readFileSync(SESSIONS_PATH)
                .toString());
        }
    } catch (e) {
        sessions = [];
    }
    return sessions;
}


function updateOrAddSession(currentSession) {
  const sessions = readSessions();

  if(!currentSession) {
      return sessions;
  }
  // don't update sessions while scanning
  const updateSession = sessions.filter(s => s[1] === currentSession)[0];
  if(typeof updateSession !== 'undefined') {
      console.log('update ' + currentSession);
      updateSession[0] = (new Date()).getTime();
  } else {
      console.log('insert ' + currentSession);
      const oldSession = sessions[sessions.length] = [];
      // http://www.english.upenn.edu/~jenglish/English104/tzara.html
      oldSession[1] = currentSession;
      oldSession[0] = (new Date()).getTime();
  }
  console.log('writing ' + SESSIONS_PATH)
  fs.writeFileSync(
      SESSIONS_PATH,
      JSON.stringify(sessions, null, 4));
  return sessions;
}

let url = 'http://localhost:4444/wd/hub';
const Command = {
  LAUNCH_APP: 'launchApp',
  GET_NETWORK_CONDITIONS: 'getNetworkConditions',
  SET_NETWORK_CONDITIONS: 'setNetworkConditions',
  DELETE_NETWORK_CONDITIONS: 'deleteNetworkConditions',
  SEND_DEVTOOLS_COMMAND: 'sendDevToolsCommand',
  SEND_AND_GET_DEVTOOLS_COMMAND: 'sendAndGetDevToolsCommand',
  SET_PERMISSION: 'setPermission',
  GET_CAST_SINKS: 'getCastSinks',
  SET_CAST_SINK_TO_USE: 'setCastSinkToUse',
  START_CAST_DESKTOP_MIRRORING: 'startDesktopMirroring',
  START_CAST_TAB_MIRRORING: 'setCastTabMirroring',
  GET_CAST_ISSUE_MESSAGE: 'getCastIssueMessage',
  STOP_CASTING: 'stopCasting',
}

function configureExecutor(executor, vendorPrefix) {
  executor.defineCommand(Command.LAUNCH_APP, 'POST', '/session/:sessionId/chromium/launch_app')
  executor.defineCommand(Command.GET_NETWORK_CONDITIONS, 'GET', '/session/:sessionId/chromium/network_conditions')
  executor.defineCommand(Command.SET_NETWORK_CONDITIONS, 'POST', '/session/:sessionId/chromium/network_conditions')
  executor.defineCommand(Command.DELETE_NETWORK_CONDITIONS, 'DELETE', '/session/:sessionId/chromium/network_conditions')
  executor.defineCommand(Command.SEND_DEVTOOLS_COMMAND, 'POST', '/session/:sessionId/chromium/send_command')
  executor.defineCommand(
    Command.SEND_AND_GET_DEVTOOLS_COMMAND,
    'POST',
    '/session/:sessionId/chromium/send_command_and_get_result',
  )
  executor.defineCommand(Command.SET_PERMISSION, 'POST', '/session/:sessionId/permissions')
  executor.defineCommand(Command.GET_CAST_SINKS, 'GET', `/session/:sessionId/${vendorPrefix}/cast/get_sinks`)
  executor.defineCommand(
    Command.SET_CAST_SINK_TO_USE,
    'POST',
    `/session/:sessionId/${vendorPrefix}/cast/set_sink_to_use`,
  )
  executor.defineCommand(
    Command.START_CAST_DESKTOP_MIRRORING,
    'POST',
    `/session/:sessionId/${vendorPrefix}/cast/start_desktop_mirroring`,
  )
  executor.defineCommand(
    Command.START_CAST_TAB_MIRRORING,
    'POST',
    `/session/:sessionId/${vendorPrefix}/cast/start_tab_mirroring`,
  )
  executor.defineCommand(
    Command.GET_CAST_ISSUE_MESSAGE,
    'GET',
    `/session/:sessionId/${vendorPrefix}/cast/get_issue_message`,
  )
  executor.defineCommand(Command.STOP_CASTING, 'POST', `/session/:sessionId/${vendorPrefix}/cast/stop_casting`)
}

function createExecutor(url, vendorPrefix) {
  const agent = new _http.Agent({ keepAlive: true })
  const client = url.then((url) => new _http.HttpClient(url, agent))
  const executor = new _http.Executor(client)
  configureExecutor(executor, vendorPrefix)
  return executor
}


async function verifySession(driver, sessionId) {
  let driver2 = new chrome.Driver(
    new Session(sessionId[1], Capabilities.chrome()), createExecutor(Promise.resolve(url)))

  try {
    let windows = await driver2.getAllWindowHandles()
    console.log('windows ', windows)
    //await driver.switchTo().window(window)
    //let status = await driver.getSession()
    return sessionId[1]
  } catch (e) {
    //console.log(e)
  }
}



var TIMEOUT = 10000;

async function getSessions(driver, inactive = false) {
  const sessions = readSessions();
  const session = await driver.getSession()
  const original = session.getId()
  let active = [].concat(sessions)
      .filter(session => typeof session[1] !== 'undefined'
              && session[1] !== null && session[1].length > 0);
  //if(inactive) {
  //    active = active.filter(session => (new Date()).getTime() - session[0] > TIMEOUT);
  //}
  let cancelled = false;
  let available = []
  for(let i = 0; i < active.length; i++) {
    let r = await verifySession(driver, active[i])
    if(typeof r !== 'undefined') {
      available[available.length] = active[i]
    }
    if(inactive) {
      cancelled = true;
    } else {
    }
  }
  session.id_ = original;

  return available
    .filter(sess => typeof sess !== 'undefined' && sess !== null)
    .filter((elem, pos, arr) => arr.indexOf(elem) === pos)
}

async function closeAllWindows(driver, sessionId, keep) {
  let driver2 = new WebDriver(
    new Session(sessionId, Capabilities.chrome()), createExecutor(Promise.resolve(url)))

  try {
    let windows = await driver2.getAllWindowHandles()
    console.log('closing session ' + sessionId[1] + ' windows ' + windows)
    for(let i = 0; i < windows.length; i++) {
      if(windows[i] != keep) {
        await driver2.switchTo().window(windows[i])
        await driver2.close()
      }
    }
  } catch (e) {
    console.log(e)
  }
}

module.exports = {
  updateOrAddSession,
  readSessions,
  getSessions,
  closeAllWindows
}

