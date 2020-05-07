/* global describe, before, it, data */

describe('WordPress migration <small>(Applies to articles with WP redirects)</small>', function () {
  before(function () {
    if (!data.wp) { this.skip() }
  })

  it('Original date matches new article date', function () {
    // Test: The original article date matches the new article date
    // Why: Migration accuracy
    // Fix: Update the date modified override date (Properties > Mandatory > Dates > Date Modified Override)
 
    var a = new Date(data.wp['date']).setSeconds(0)
    var b = new Date(data.meta['gcModifiedOverride']).setSeconds(0)
     
    a.should.equal(b)
  })

  it('Same description', function () {
    // Test: The original article description matches new article description
    // Why: Migration accuracy
    // Fix: Update the description (Properties > Mandatory > Descriptive metadata > Description)
 
    var wp = data.wp['excerpt'].replace(/\.$/, '')
    var aem = data.meta['gcDescription'].replace(/\.$/, '')
 
    try {
      wp.should.equal(aem)
    } catch (e) {
      this.skip() // Warning only
    }
  })

  it('Same tags', function () {
    // Test: The original article tags matches new article tags
    // Why: Migration accuracy
    // Fix: Update the tags in the keywords (Properties > Mandatory > Descriptive metadata > Keywords)
 
    data.wp['tags'].forEach(function (tag) {
      tag.should.be.oneOf(data.meta['tags'])
    })
  })

  /*
  it('Correct category', function () {
    var wp = data.wp['category']
    var aem = data.url.match(/(feuille-derable|maple-leaf)\/(\w+)\//)[2]
    //var aem = data.url.match(//)
  })*/

})
