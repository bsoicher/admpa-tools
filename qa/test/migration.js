/* global describe, before, it, data */

describe('WordPress migration <small>(Applies to articles with WP redirects)</small>', function () {
  before(function () {
    if (!data.wp) { this.skip() }
  })

  it('Original date matches new article date', function () {
    var wp = new Date(data.wp['date']).setSeconds(0)
    var aem = new Date(data.meta['gcModifiedOverride']).setSeconds(0)
    wp.should.equal(aem)
  })

  it('Same description', function () {
    var wp = data.wp['excerpt'].replace(/\.$/, '')
    var aem = data.meta['gcDescription'].replace(/\.$/, '')
    try {
      wp.should.equal(aem)
    } catch (e) {
      this.skip() // Warning only
    }
  })

  it('Same tags', function () {
    data.wp['tags'].forEach(function (tag) {
      tag.should.be.oneOf(data.meta['tags'])
    })
  })

  it('Correct category', function () {
    var wp = data.wp['category']
    var aem = data.url.match(/(feuille-derable|maple-leaf)\/(\w+)\//)[2]
    //var aem = data.url.match(//)
  })

})
