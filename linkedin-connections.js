
const getClient = require('./webdriver.js')
const {getAllUntil} = require('./util-getall.js')
const loginLinkedIn = require('./linkedin-auth.js')

async function listConnections(driver) {
  if(!driver) {
    driver = await getClient()
    await loginLinkedIn(driver)
  }

  let url = await driver.getCurrentUrl()
  let loggedIn = url.indexOf('mynetwork') > -1
  if(!loggedIn) {
    await driver.get('https://www.linkedin.com/mynetwork/')
    await new Promise(resolve => setTimeout(resolve, 5000))
  }

  let result = await getAllUntil(driver, 
    false,
    '//a[contains(@href, "/in/")]/@href',
    /* friends */ [],
    (a, b) => a === b,
    (i) => i < 10
  )

  console.log(result)

  return result.filter((l, i, arr) => arr.indexOf(l) === i)
}

module.exports = {
  listConnections
}


if(require.main === module && process.argv[1] == __filename) {
  listConnections().then(result => {
    console.log(result)
  })
}

