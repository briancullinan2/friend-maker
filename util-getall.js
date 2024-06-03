const walkTree = require('./util-walktree.js')
const { Builder, Browser, By, Key, until } = require('selenium-webdriver')


async function scrollClient(driver, selector, up = false) {
  // scroll to bottom of messages
  return await driver
    .executeScript((selector, up = false) => {
      if (selector === '' || selector === false) {
        window.scroll(window.scrollX, window.scrollY + (up ? -100000 : 100000));
        return;
      }
      var people = document.evaluate(
        selector,
        document, null,
        XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      people.scrollTop = people.scrollTop + (up ? -100000 : 100000);
    }, selector, up)
}

function evaluateDom(select, ctx, evaluate, query) {
  try {
  //    let $ = cheerio.load(ctx)
      //if(!select.match(/^\/|\*\/|\.\//ig) && select.localeCompare('*') !== 0) { // probably XPath, fall through
      //    return query(select);
      //}
  } catch (e) {
      // TODO: determine any side effects of ignoring
      if(e.name !== 'SyntaxError') {
          console.log(select.localeCompare('*'))
          console.log(select)
          console.log(query)
          throw e
      }
  }
  
  try {
      if(select.includes('//*')) {
          console.warn(`Possible slow query evaluation due to wildcard: ${select}`)
      }
      // defaults to trying for iterator type
      //   so it can automatically be ordered
      var iterator = document.evaluate(select, ctx, null,
        XPathResult.ORDERED_NODE_ITERATOR_TYPE, null)
      //var iterator = evaluate(select, ctx, null, 5, null)
      // TODO: create a pattern regonizer for bodyless while
      var co = []
      var m
      while (m = iterator.iterateNext()) {
          co.push(m.nodeValue || m)
      }
      return co
  } catch (e) {
      if(e.message.includes('Value should be a node-set')
         || e.message.includes('You should have asked')) {
          var result = document.evaluate(select, ctx, null,
              (XPathResult || {}).ANY_TYPE || 0, null)
          return result.resultType === ((XPathResult || {}).NUMBER_TYPE || 1)
              ? result.numberValue
              : result.resultType === ((XPathResult || {}).STRING_TYPE || 2)
              ? result.stringValue
              : result.resultType === ((XPathResult || {}).BOOLEAN_TYPE || 3)
              ? result.booleanValue
              : result.resultValue
      }
      throw e;
  }
}


function execGetAllXPath(select, ctx) {
  var eval = ctx.evaluate || ctx.ownerDocument.evaluate;
  var query = ctx.querySelector.bind(ctx.ownerDocument)
      || ctx.ownerDocument.querySelector.bind(ctx.ownerDocument)
  return walkTree(select, ctx, (select, ctx) => {
      return evaluateDom(select, ctx, eval, query)
  })
}


async function getAllXPath(driver, select, ctx) {
  return await driver.executeScript((
    function main(evaluateDomString, walkTreeString, getAllXPathString, select, ctx) {
      let evaluateDom = window.evaluateDom = eval('(' + evaluateDomString + ')')
      let walkTree = window.walkTree = eval('(' + walkTreeString + ')')
      let getAllXPath = window.getAllXPath = eval('(' + getAllXPathString + ')')
      let result = getAllXPath(select, ctx || document)
      return result;
    }), evaluateDom, walkTree, execGetAllXPath, select, ctx)
}


async function getAllUntil(driver, scrollableSelector,
                     dataSelector,
                     set = [],
                     compare = (a, b) => a === b,
                     cb = (i) => i < 3,
                     up = false,
                     i = 0) {
  //let body = await driver.findElement(By.css('body'))
  let result = await execGetAllXPath(driver, dataSelector)
  //let result = await driver.executeScript('return (function main() {\n return 1;\n})()')

  let newPosts = ((typeof result === 'string' ? [result] : result) || [])
    .filter(e => set
      .filter(m => compare(e, m)).length === 0);
  set = newPosts.concat(set);
  if(newPosts.length > 0 && await cb(i)) {
    await scrollClient(driver, scrollableSelector, up)
    await new Promise(resolve => setTimeout(resolve, 1000))
    await scrollClient(driver, scrollableSelector, up)
    await new Promise(resolve => setTimeout(resolve, 1000))
    return await getAllUntil(driver, scrollableSelector, dataSelector, set, compare, cb, up, i + 1)
  }
  return set
}


module.exports = {
  scrollClient,
  getAllXPath,
  getAllUntil
}
