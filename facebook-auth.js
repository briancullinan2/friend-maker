
const getClient = require('./webdriver.js')
const getCredentials = require('./credentials.js')
const { Builder, Browser, By, Key, until } = require('selenium-webdriver')

async function enterFacebook(driver) {
  console.log('Facebook: Sign in required');

  var credentials = getCredentials('facebook.com')

  //let body = await driver.findElement(By.css('body'))
  await driver.wait(until.elementLocated(By.css('.login-form, [type="submit"]')), 10000);
  let submit = await driver.findElement(By.css('.login-form, [type="submit"]'))

  let login = await driver.findElement(By.css('input[name*="email"]'))
  
  await driver.executeScript('arguments[0].click();', login)
  await driver.actions().sendKeys(credentials.username).perform()

  await new Promise(resolve => setTimeout(resolve, 1000))

  //await pass.sendKeys(credentials.username)
  //await driver.executeScript('arguments[0].value="' + credentials.username + '";', login)
  
  console.log('Facebook: Require password')

  let pass = await driver.findElement(By.css('input[name*="pass"]'))
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

async function loginFacebook(driver) {
  if(!driver) {
    driver = await getClient();
  }

  let url = await driver.getCurrentUrl()
  let loggedIn = url.indexOf('linkedin') > -1 && url.indexOf('login') == -1
              && url.indexOf('authwall') == -1

  if(loggedIn) {
    if(await driver.findElement(By.xpath('iframe.authentication-iframe'))) {
      await driver.frame((await driver.element('iframe.authentication-iframe')).value)
      await enterFacebook()
      await frame()
    }
  } else {
    await driver.get('https://www.facebook.com/')
    let loginLink, loginLink2
    try {
      loginLink = await driver.findElement(By.xpath('//a[text()[contains(.,"Forgot password?")]]'))
    } catch (e) {}
    try {
      loginLink2 = await driver.findElement(By.xpath('//a[text()[contains(.,"Create new account")]]'))
    } catch (e) {}
    if(loginLink || loginLink2) {
      await enterFacebook(driver)
    }
  }

  return driver
}

module.exports = loginFacebook

if(require.main === module && process.argv[1] == __filename) {
  loginFacebook().then(client => {
    console.log(client)
  })
}
