//var {remote} = require('webdriverio');
const {updateOrAddSession, getSessions, closeAllWindows} = require('./sessions.js')
const { Builder, Browser, By, Key, until } = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome');


var webdriverServer = {
  services: ['selenium-standalone', 'chromedriver'],
  sync: false,
  debug: false,
  host: 'localhost',
  port: 4444,
  logLevel: 'silent',
  baseUrl: 'https://webdriver.io',
  pageLoadStrategy: 'eager',
  connectionRetryTimeout: 5000,
  waitforTimeout: 15000,
  capabilities: {
      browserName: 'chrome',
      'goog:chromeOptions': {
          prefs: {
              'download.default_directory': '/data/downloads',
              'profile.default_content_setting_values.notifications': 2,
              'exited_cleanly': true,
              'exit_type': 'None'
          },
          args: [
              // We stopped using sessions here because it injects the session using the API below
              // TODO: https://superuser.com/questions/461035/disable-google-chrome-session-restore-functionality
              'user-data-dir=/tmp/profile-1',
              // 'start-fullscreen',
              'no-sandbox',
              'disable-session-crashed-bubble',
              'disable-infobars',
              'new-window',
              'disable-geolocation',
              'disable-notifications',
              'show-saved-copy',
              'silent-debugger-extension-api'
              //'kiosk'
          ]
      }
  },
};


//console.log('deleting webdriver from cache');
//Object.keys(require.cache).filter(k => k.includes('webdriver') || k.includes('wdio'))
//    .forEach(k => delete require.cache[k]);
async function getClient() {
  console.log('starting client')
  //var client = await remote(webdriverServer);
  //client.setTimeout({ 'implicit': 15000 })
  //client.setTimeout({ 'pageLoad': 15000 })
  //let windows = await client.getWindowHandles();
  let builder = await new Builder().forBrowser(Browser.CHROME)
  let options = new chrome.Options()
  options.addArguments('--user-data-dir=/tmp/profile-1')
  builder.setChromeOptions(options)
  let driver = builder.build()
  await updateOrAddSession((await driver.getSession()).getId())
  let sessions = await getSessions(driver, true)

  let session = await driver.getSession()
  let original = session.getId()
  //for(let i = 0; i < sessions.length; i++) {
  //  if(sessions[i][1] != original) {
  //    await closeAllWindows(driver, sessions[i])
  //  }
  //}
  session.id_ = original
  return driver
}

module.exports = getClient

if(require.main === module && process.argv[1] == __filename) {
  getClient().then(client => {
    //console.log(client)
  })
}

