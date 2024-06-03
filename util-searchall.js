const fs = require('fs')
const {getAllXPath} = require('./util-getall.js')
const getClient = require('./webdriver.js')
const { Builder, Browser, By, Key, until } = require('selenium-webdriver')


const engines = [
 // 'https://www.ask.com/web?q=',
  'https://www.google.com/search?q=',
  'https://www.bing.com/search?q=',
/*  ,
  'https://search.yahoo.com/search?p=',
  'https://search.aol.com/aol/search?q=',
  'http://www.baidu.com/s?wd=',
  'https://www.wolframalpha.com/input/?i=',
  'https://duckduckgo.com/?q=',
  'https://www.yandex.com/search/?text=',
  'https://archive.org/search.php?query=',
*/
]




async function searchAll(driver, query) {
  if(!driver) {
    driver = await getClient()
  }

  let results = []
  for(let i = 0; i < engines.length; i++) {
    await driver.get(engines[i] + query)
    await new Promise(resolve => setTimeout(resolve, 1000))

    let search = await getAllXPath(driver, {
      query: '//input[contains(@aria-label, "Search")]/@value'
      +
      '|//input[contains(@aria-label, "search")]/@value'
      +
      '|//textarea[contains(@aria-label, "Search")]/@value'
      +
      // yahoo
      '|//label[contains(., "Search")]/following::*//input[@type="text"]/@value' 
      +
      '|//input[contains(@class, "Search")]/@value'
      +
      // wolfram
      '|//input[contains(@name, "query")]/@value'
      +
      // duckduckgo
      '|//input[contains(@placeholder, "Search")]/@value'
      +
      '|//input[contains(@id, "search")]/@value'
      +
      // yandex
      '|//input[contains(@aria-label, "Request")]/@value',
      results: [
          '//h3|//div//h2|//div[contains(@class, "title")]'
          +
          // ask
          '|//*[contains(@class, "result-title")]',
          {
              name: './/text()',
              link: './/a/@href|.//following-sibling::a/@href|.//following-sibling::div//a/@href|./parent::a/@href',
              summary: './/following-sibling::div//text()|.//following-sibling::p//text()'
          }
      ]
    })

    results[results.length] = {
      url: engines[i] + query,
      query: typeof search.query === 'string'
          ? search.query
          : search.query[0],
      results: search.results.filter(s => s.summary).map(s => ({
          name: typeof s.name === 'string'
              ? s.name : s.name.join('\n'),
          link: typeof s.link === 'string'
              ? s.link : s.link[0],
          summary: typeof s.summary === 'string'
              ? s.summary : s.summary.join('\n')
      }))
    }

    console.log(results[results.length-1])

  }

  return results
}


module.exports = searchAll


if(require.main === module && process.argv[1] == __filename) {
  searchAll(null, 'thought leader ai news').then(result => {
    console.log(result)
  })
}



