const fs = require('fs')
const {getAllXPath} = require('./util-getall.js')
const getClient = require('./webdriver.js')
const { Builder, Browser, By, Key, until } = require('selenium-webdriver')
const {PROJECT_PATH} = require('./config.js')
const searchAll = require('./util-searchall.js')
const loginLinkedIn = require('./linkedin-auth.js')

async function linkedinPost(driver, query) {
  if(!driver) {
    driver = await getClient()
  }

  let posts = []
  if(fs.existsSync(PROJECT_PATH + '/posts.json')) {
    posts = JSON.parse(fs.readFileSync(
    PROJECT_PATH + '/posts.json'))
  }

  let searches = await searchAll(driver, query)
  let newPosts = searches.map(s => s.results).flat(1)
    .filter(search => posts.indexOf(search.link) == -1)

  await loginLinkedIn(driver)


  let startButton
  try {
    startButton = await driver.findElements(By.xpath('//button[contains(., "Start a post")]'))
  } catch (e) {}
  if(startButton[0] && await startButton[0].isDisplayed()) {
    await startButton[0].click()
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  
  let messageBox
  try {
    messageBox = await driver.findElements(By.xpath('//*[@aria-multiline="true"]'))
  } catch (e) {}
  if(messageBox[0] && await messageBox[0].isDisplayed()) {
    await messageBox[0].sendKeys(newPosts[0].link)
    await new Promise(resolve => setTimeout(resolve, 2000))
  }


  let postButton
  try {
    postButton = await driver.findElements(By.xpath('//button[contains(., "Post") and contains(@class, "primary")]'))
  } catch (e) {}
  if(postButton[0] && await postButton[0].isDisplayed()) {
    await postButton[0].click()
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  posts[posts.length] = newPosts[0].link

  fs.writeFileSync(
    PROJECT_PATH + '/posts.json',
    JSON.stringify(posts, null, 4));


}


module.exports = {
  linkedinPost
}


if(require.main === module && process.argv[1] == __filename) {
  linkedinPost(null, 'thought leader ai news').then(result => {
    console.log(result)
  })
}
