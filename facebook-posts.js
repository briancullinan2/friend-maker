const fs = require('fs')
const getClient = require('./webdriver.js')
const {getAllUntil, getAllXPath} = require('./util-getall.js')
const loginFacebook = require('./facebook-auth.js')
const {FACEBOOK_PATH} = require('./config.js')
const { Builder, Browser, By, Key, until } = require('selenium-webdriver')

async function listPosts(driver, profile) {
  if(!driver) {
    driver = await getClient()
    await loginFacebook(driver)
  }

  let url = await driver.getCurrentUrl()
  if(profile.indexOf('facebook.com') == -1) {
    profile = 'https://www.facebook.com' + profile
  }

  let loggedIn = url.indexOf(profile) > -1
  if(!loggedIn) {
    await driver.get(profile)
    await new Promise(resolve => setTimeout(resolve, 4000))
  }


  let articles = await getAllXPath(driver, ['//div[@role="article" and .//a[@role="link"]]'])
  for(let i = 0; i < articles.length; i++) {

    let article = articles[i].findElement(By.xpath('.//div[./span[@dir="auto"]][2]//a'))
    await driver.actions().move({origin: article}).perform()
    await new Promise(resolve => setTimeout(resolve, 500))
    let link = await getAllXPath(driver, ['.//div[./span[@dir="auto"]][2]//a/@href'], articles[i])
    let title = await getAllXPath(driver, ['.//div[@data-ad-preview="message"]//text()|.//blockquote//text()'], articles[i])
    let comments = await getAllXPath(driver, ['.//div[@role="article"]', './/text()'], articles[i])
    console.log(link[0], title.filter(x => x != 'Facebook'), comments)

  }
  

  return result.filter((l, i, arr) => arr.indexOf(l) === i)
}

module.exports = listPosts


if(require.main === module && process.argv[1] == __filename) {
  listPosts(null, '/?filter=friends&sk=h_chr').then(result => {
    console.log(result)
  })
}

