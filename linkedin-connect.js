const fs = require('fs')
const getClient = require('./webdriver.js')
const {getAllUntil} = require('./util-getall.js')
const loginLinkedIn = require('./linkedin-auth.js')
const {PROJECT_PATH} = require('./config.js')
const { Builder, Browser, By, Key, until } = require('selenium-webdriver')




async function visitConnections(driver) {
  if(!driver) {
    driver = await getClient()
    await loginLinkedIn(driver)
  }

  let newConnections = []
  if(fs.existsSync(PROJECT_PATH + '/new_connections.json')) {
    newConnections = JSON.parse(fs.readFileSync(
    PROJECT_PATH + '/new_connections.json'))
  }

  let connections = []
  if(fs.existsSync(PROJECT_PATH + '/connections.json')) {
    connections = JSON.parse(fs.readFileSync(
    PROJECT_PATH + '/connections.json'))
  }

  for(let i = 0; i < connections.length; i++) {
    if(newConnections.indexOf(connections[i]) > -1) {
      continue
    }

    let url = await driver.getCurrentUrl()

    if(url.indexOf(connections[i]) == -1) {
      if(connections[i].indexOf('linkedin.com') == -1) {
        connections[i] = 'https://www.linkedin.com' + connections[i]
      }

      await driver.get(connections[i])
      await new Promise(resolve => setTimeout(resolve, 4000))
    }

    
    await connectLinkedin(driver, connections[i])

    let limitButton
    try {
      limitButton = await driver.findElements(By.xpath('//button[contains(., "Got it")]'))
    } catch (e) {}
    if(limitButton[0] && await limitButton[0].isDisplayed()) {
      break
    }

    newConnections[newConnections.length] = connections[i]
    fs.writeFileSync(
      PROJECT_PATH + '/new_connections.json',
      JSON.stringify(newConnections, null, 4));
  }


}



async function connectLinkedin(driver, profile) {
  if(!driver) {
    driver = await getClient()
    await loginLinkedIn(driver)
  }


  let url = await driver.getCurrentUrl()
  let loggedIn = url.indexOf(profile) > -1
  if(!loggedIn) {
    if(profile.indexOf('linkedin.com') == -1) {
      profile = 'https://www.linkedin.com' + profile
    }

    await driver.get(profile)
    await new Promise(resolve => setTimeout(resolve, 4000))
  }


  let connectButton, moreButton
  try {
    connectButton = await driver.findElements(By.xpath('//main//button[contains(., "Connect")]'))
  } catch (e) {}
  if(!connectButton[0] || !(await connectButton[0].isDisplayed())) {
    try {
      moreButton = await driver.findElement(By.xpath('//main//button[contains(., "More")]'))
    } catch (e) {}
    if(moreButton) {
      //await driver.executeScript('arguments[0].click();', moreButton)
      await moreButton.click()
      await new Promise(resolve => setTimeout(resolve, 1000))

      try {
        connectButton = await driver.findElements(By.xpath('//main//div[@role="button" and ./*[contains(.,"Connect")] and not(contains(., "Remove"))]'))
      } catch (e) {}
      if(connectButton[0]) {
        //driver.actions().move({origin: connectButton}).perform()
        //await driver.executeScript('arguments[0].click();', connectButton)
        await connectButton[0].click()
      }
    }
  } else {
    await connectButton[0].click()
  }

  await new Promise(resolve => setTimeout(resolve, 1000))

  let sendButton
  try {
    sendButton = await driver.findElements(By.xpath('//button[contains(., "Send ")]'))
  } catch (e) {}
  if(sendButton[0]) {
    await sendButton[0].click()

    await new Promise(resolve => setTimeout(resolve, 1000))
  }

}



module.exports = {
  visitConnections,
  connectLinkedin
}


if(require.main === module && process.argv[1] == __filename) {
  visitConnections().then(result => {
    console.log(result)
  })
}

