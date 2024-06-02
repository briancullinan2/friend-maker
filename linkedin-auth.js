
const getClient = require('./webdriver.js')
const getCredentials = require('./credentials.js')
const { Builder, Browser, By, Key, until } = require('selenium-webdriver')

async function enterLinkedIn(driver) {
  console.log('LinkedIn: Sign in required');

  var credentials = getCredentials('linkedin.com')

  let loginButton = await driver.findElement(By.css('a[href*="/login"]'))
  if(!loginButton.error) {
    try {
      await loginButton.click()
    } catch (e) {}
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  //let body = await driver.findElement(By.css('body'))
  let submit = await driver.findElement(By.css('.login-form, [type="submit"]'))

  let login = await driver.findElement(By.css('input[name*="session_key"]'))
  await driver.wait(until.elementLocated(By.css('.login-form, [type="submit"]')), 10000);
  
  await driver.executeScript('arguments[0].click();', login)
  await driver.actions().sendKeys(credentials.username).perform()

  await new Promise(resolve => setTimeout(resolve, 1000))

  //await pass.sendKeys(credentials.username)
  //await driver.executeScript('arguments[0].value="' + credentials.username + '";', login)
  
  console.log('LinkedIn: Require password')

  let pass = await driver.findElement(By.css('input[name*="session_password"]'))
  await pass.click()
  await pass.sendKeys(credentials.password)

  await submit.click()

  await new Promise(resolve => setTimeout(resolve, 3000))

  let loginStill, loginStill2
  try {
    loginStill = await driver.findElement(By.css('#captcha-internal'))
  } catch (e) {}
  try {
    loginStill2 = await driver.findElement(By.css('input[name*="session_password"]'))
  } catch (e) {}
  if(loginStill || loginStill2) {
    throw new Error('captcha')
  }
}

async function loginLinkedIn(driver) {
  if(!driver) {
    driver = await getClient();
  }

  //if((await driver.alertText()).indexOf('leave') > -1) {
  //  await driver.alertAccept()
  //}
  //await driver.pause(1000)

  let url = await driver.getCurrentUrl()
  let loggedIn = url.indexOf('linkedin') > -1 && url.indexOf('login') == -1
              && url.indexOf('authwall') == -1

  if(loggedIn) {
    if(await driver.findElement(By.xpath('iframe.authentication-iframe'))) {
      await driver.frame((await driver.element('iframe.authentication-iframe')).value)
      await enterLinkedIn()
      await frame()
    }
  } else {
    //await driver.executeScript('window.location="https://www.linkedin.com/"', [])
    //await driver.url('https://www.linkedin.com/')
    await driver.get('https://www.linkedin.com/')
    let loginLink, loginLink2
    try {
      loginLink = await driver.findElement(By.xpath('//a[text()[contains(.,"Forgot password?")]]'))
    } catch (e) {}
    try {
      loginLink2 = await driver.findElement(By.xpath('//a[text()[contains(.,"Join now")]]'))
    } catch (e) {}
    if(loginLink || loginLink2) {
      await enterLinkedIn(driver)
    }
  }

  return driver
}

module.exports = loginLinkedIn

if(require.main === module && process.argv[1] == __filename) {
  loginLinkedIn().then(client => {
    console.log(client)
  })
}
