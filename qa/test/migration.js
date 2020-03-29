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
})
