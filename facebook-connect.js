const fs = require('fs')
const getClient = require('./webdriver.js')
const {getAllUntil} = require('./util-getall.js')
const loginFacebook = require('./facebook-auth.js')
const {FACEBOOK_PATH} = require('./config.js')
const { Builder, Browser, By, Key, until } = require('selenium-webdriver')




async function visitFriends(driver) {
  if(!driver) {
    driver = await getClient()
    await loginFacebook(driver)
  }

  let newConnections = []
  if(fs.existsSync(FACEBOOK_PATH + '/new_friends.json')) {
    newConnections = JSON.parse(fs.readFileSync(
      FACEBOOK_PATH + '/new_friends.json'))
  }

  let connections = []
  if(fs.existsSync(FACEBOOK_PATH + '/friends.json')) {
    connections = JSON.parse(fs.readFileSync(
      FACEBOOK_PATH + '/friends.json'))
  }

  for(let i = 0; i < connections.length; i++) {
    if(newConnections.indexOf(connections[i]) > -1) {
      continue
    }

    let url = await driver.getCurrentUrl()

    if(url.indexOf(connections[i]) == -1) {
      if(connections[i].indexOf('facebook.com') == -1) {
        connections[i] = 'https://www.facebook.com' + connections[i]
      }

      await driver.get(connections[i])
      await new Promise(resolve => setTimeout(resolve, 4000))
    }

    
    await friendFacebook(driver, connections[i])

    let limitButton
    try {
      limitButton = await driver.findElements(By.xpath('//button[contains(., "Got it")]'))
    } catch (e) {}
    if(limitButton[0] && await limitButton[0].isDisplayed()) {
      limitButton[0].click()
      break
    }

    newConnections[newConnections.length] = connections[i]
    fs.writeFileSync(
      FACEBOOK_PATH + '/new_friends.json',
      JSON.stringify(newConnections, null, 4));
  }


}



async function friendFacebook(driver, profile) {
  if(!driver) {
    driver = await getClient()
    await loginFacebook(driver)
  }


  let url = await driver.getCurrentUrl()
  let loggedIn = url.indexOf(profile) > -1
  if(!loggedIn) {
    if(profile.indexOf('facebook.com') == -1) {
      profile = 'https://www.facebook.com' + profile
    }

    await driver.get(profile)
    await new Promise(resolve => setTimeout(resolve, 4000))
  }


  let connectButton, moreButton
  try {
    connectButton = await driver.findElements(By.xpath('//*[@role="button" and contains(., "Add friend")]'))
  } catch (e) {}
  if(!connectButton[0] || !(await connectButton[0].isDisplayed())) {
    // todo:
  } else {
    await connectButton[0].click()

    await new Promise(resolve => setTimeout(resolve, 1000))
  }

}



module.exports = {
  visitFriends,
  friendFacebook
}


if(require.main === module && process.argv[1] == __filename) {
  visitFriends().then(result => {
    console.log(result)
  })
}

