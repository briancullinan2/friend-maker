const fs = require('fs')
const getClient = require('./webdriver.js')
const {getAllUntil} = require('./util-getall.js')
const loginFacebook = require('./facebook-auth.js')
const {FACEBOOK_PATH} = require('./config.js')
const { Builder, Browser, By, Key, until } = require('selenium-webdriver')

async function listFriends(driver) {
  if(!driver) {
    driver = await getClient()
    await loginFacebook(driver)
  }

  let url = await driver.getCurrentUrl()
  let loggedIn = url.indexOf('suggestions') > -1
  if(!loggedIn) {
    await driver.get('https://www.facebook.com/friends/suggestions')
    await new Promise(resolve => setTimeout(resolve, 4000))
  }

  let result = await getAllUntil(driver, 
    '//div[@aria-label="Suggestions"]/div/div[2]',
    '//div[@aria-label="Suggestions"]//a[@role="link"]/@href',
    /* friends */ [],
    (a, b) => a === b,
    (i) => i < 10
  )

  fs.writeFileSync(
    FACEBOOK_PATH + '/friends.json',
    JSON.stringify(result, null, 4));

  return result.filter((l, i, arr) => arr.indexOf(l) === i)
}

module.exports = listFriends


if(require.main === module && process.argv[1] == __filename) {
  listFriends().then(result => {
    console.log(result)
  })
}

