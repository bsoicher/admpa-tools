/* global describe, it, data, moment */

describe('Date', function () {

  it('should have date override enabled', function () {
    data.meta.should.have.own.property('gcModifiedIsOverridden', 'true')
  })

  it('should have date override set', function () {
    data.meta.should.have.own.property('gcModifiedOverride')
    data.meta['gcModifiedOverride'].should.be.a('string').and.not.equal('')
  })

  it('should have alt date override enabled', function () {
    data.meta.alt.should.have.own.property('gcModifiedIsOverridden', 'true')
  })

  it('should have alt date override set', function () {
    data.meta.alt.should.have.own.property('gcModifiedOverride')
    data.meta.alt['gcModifiedOverride'].should.be.a('string').and.not.equal('')
  })

  it('should have the same date override for both languages', function () {
    data.meta['gcModifiedOverride'].should.equal(data.meta.alt['gcModifiedOverride'])
  })

  describe('WordPress migration', function () {
    it('should match original wordpress date', function () {
      if (!data.wp) {
        this.skip() // Not migrated
      }
      var wp = moment(data.wp['date']).format('LLL').should.equal()
      var aem = moment(data.meta['gcModifiedOverride']).format('LLL')
      wp.should.equal(aem)
    })
  })

  

  it('should have byline with same date')
})
