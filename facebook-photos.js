const fs = require('fs')
const getClient = require('./webdriver.js')
const {getAllUntil} = require('./util-getall.js')
const loginFacebook = require('./facebook-auth.js')
const {FACEBOOK_PATH} = require('./config.js')
const { Builder, Browser, By, Key, until } = require('selenium-webdriver')

async function listPhotos(driver, profile) {
  if(!driver) {
    driver = await getClient()
    await loginFacebook(driver)
  }

  if(!profile) {
    profile = '/ania.kaush'
  }

  let url = await driver.getCurrentUrl()
  if(profile.indexOf('facebook.com') == -1) {
    profile = 'https://www.facebook.com' + profile
  }
  
  let loggedIn = url.indexOf('photos') > -1
  if(!loggedIn) {
    if(profile.indexOf('id=')) {
      profile = profile + '&sk=photos'
    } else {
      profile = profile + '/photos'
    }

    await driver.get(profile)
    await new Promise(resolve => setTimeout(resolve, 4000))
  }

  let result = await getAllUntil(driver, 
    false,
    '//div[@role="main"]//a[@role="link" and contains(@href, "photo.php")]/@href',
    /* friends */ [],
    (a, b) => a === b,
    (i) => i < 10
  )

  fs.writeFileSync(
    FACEBOOK_PATH + '/photos.json',
    JSON.stringify(result, null, 4));

  return result.filter((l, i, arr) => arr.indexOf(l) === i)
}

module.exports = listPhotos


if(require.main === module && process.argv[1] == __filename) {
  listPhotos(null, '/profile.php?id=100005902158184').then(result => {
    console.log(result)
  })
}

