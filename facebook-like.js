const fs = require('fs')
const getClient = require('./webdriver.js')
const {getAllUntil} = require('./util-getall.js')
const loginFacebook = require('./facebook-auth.js')
const {FACEBOOK_PATH} = require('./config.js')
const { Builder, Browser, By, Key, until } = require('selenium-webdriver')




async function visitPhotos(driver) {
  if(!driver) {
    driver = await getClient()
    await loginFacebook(driver)
  }

  let newConnections = []
  if(fs.existsSync(FACEBOOK_PATH + '/new_likes.json')) {
    newConnections = JSON.parse(fs.readFileSync(
      FACEBOOK_PATH + '/new_likes.json'))
  }

  let connections = []
  if(fs.existsSync(FACEBOOK_PATH + '/photos.json')) {
    connections = JSON.parse(fs.readFileSync(
      FACEBOOK_PATH + '/photos.json'))
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

      
    let likeButton
    try {
      likeButton = await driver.findElements(By.xpath('//*[@role="button" and contains(., "Like")]'))
    } catch (e) {}
    if(!likeButton[0] || !(await likeButton[0].isDisplayed())) {
      // todo:
    } else {
      await likeButton[0].click()

      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    
    newConnections[newConnections.length] = connections[i]
    fs.writeFileSync(
      FACEBOOK_PATH + '/new_likes.json',
      JSON.stringify(newConnections, null, 4));
  }


}


module.exports = {
  visitPhotos
}


if(require.main === module && process.argv[1] == __filename) {
  visitPhotos().then(result => {
    console.log(result)
  })
}

