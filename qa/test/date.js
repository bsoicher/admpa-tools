/* global describe, it, data */

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

  it('should have byline with same date')
})
