const fs = require('fs')
const getClient = require('./webdriver.js')
const {getAllUntil, getAllXPath} = require('./util-getall.js')
const loginLinkedIn = require('./linkedin-auth.js')
const {PROJECT_PATH} = require('./config.js')
const { Builder, Browser, By, Key, until } = require('selenium-webdriver')
const {getMessageResponse} = require('./openai-chat.js')

// todo: list all posts from a page
async function listPosts(driver, group) {
  if(!driver) {
    driver = await getClient()
    await loginLinkedIn(driver)
  }

  if(!group) {
    group = '/groups/1814785/'
  }

  if(group.indexOf('linkedin.com') == -1) {
    group = 'https://www.linkedin.com' + group
  }


  await driver.get(group)
  await new Promise(resolve => setTimeout(resolve, 4000))


  let result = await getAllUntil(driver, 
    false,
    '//div[@data-urn]/@data-urn',
    /* friends */ [],
    (a, b) => a === b,
    (i) => i < 5
  )

  return result.map(urn => 'https://www.linkedin.com/feed/update/' + urn)
}


// todo: comment on all posts that haven't been interacted with previously
async function commentOnPosts(driver, postsPage) {
  if(!driver) {
    driver = await getClient()
    await loginLinkedIn(driver)
  }

  let posts = []
  if(fs.existsSync(PROJECT_PATH + '/posts_commented.json')) {
    posts = JSON.parse(fs.readFileSync(
    PROJECT_PATH + '/posts_commented.json'))
  }

  let newPosts = (await listPosts(driver, postsPage))
//    .map(s => s.results).flat(1)
    .filter(post => posts.indexOf(post) == -1)


  for (let i = 0; i < newPosts.length; i++) {

    if(newPosts[i].indexOf('linkedin.com') == -1) {
      newPosts[i] = 'https://www.linkedin.com' + newPosts[i]
    }
  
    await driver.get(newPosts[i])
    await new Promise(resolve => setTimeout(resolve, 4000))
  

    //   skip posts that are older than 1 week
    let isWeeks
    try {
      isWeeks = await driver.findElements(By.xpath('//span[contains(text(), "weeks ago")]|//span[contains(text(), "months ago")]|//span[contains(text(), "years ago")]'))
    } catch (e) { console.log(e) }
    if(!isWeeks[0]) {
      // TODO: comment either on the most complex comment in the list, 
      //   or comment on the post text itself, 
      //   or comment on the article
      let comments = await getAllXPath(driver, ['//span[contains(@class, "comment-item")]//text()'])
      let post = await getAllXPath(driver, ['(//div[contains(@class, "show-more-text")])[1]//text()'])

      // todo: chatgpt
      let newResponse = await getMessageResponse(null, 'please write a short social media comment for this post ' + post.join('').trim() + '\n\ncomments:\n' + comments.join('').replace(/\s*\n\n\s*/ig, '\n'))

      console.log(newResponse)

      let messageBox
      try {
        messageBox = await driver.findElements(By.xpath('//*[contains(@aria-placeholder, "Add a comment")]'))
      } catch (e) {}
      if(messageBox[0] && await messageBox[0].isDisplayed()) {
        await messageBox[0].click()
        await messageBox[0].sendKeys(newResponse[newResponse.length-1].content.replace(/[^a-z0-9\!\.\-#\s]/ig, ''))
        await new Promise(resolve => setTimeout(resolve, 3000))
      }


      let postButton
      try {
        postButton = await driver.findElements(By.xpath('//button[contains(., "Post") and contains(@class, "primary")]'))
      } catch (e) {}
      if(postButton[0] && await postButton[0].isDisplayed()) {
        await postButton[0].click()
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    posts[posts.length] = newPosts[i]

    fs.writeFileSync(
      PROJECT_PATH + '/posts_commented.json',
      JSON.stringify(posts, null, 4));
  }


}


module.exports = { listPosts, commentOnPosts }


if(require.main === module && process.argv[1] == __filename) {
  commentOnPosts().then(result => {
    console.log(result)
  })
}

