/* global describe, it, data */

/**
 * Date related tests
 */
describe('Date modified override', function () {

  it('should have date override enabled', function () {
    data.meta.should.have.own.property('gcModifiedIsOverridden', 'true')
    data.meta.should.have.own.property('gcModifiedOverride')
  })

  it('should have date override set', function () {
    data.meta['gcModifiedOverride'].should.be.a('string').and.not.equal('')
  })

  it('should have alt date override enabled', function () {
    data.meta.alt.should.have.own.property('gcModifiedIsOverridden', 'true')
    data.meta.alt.should.have.own.property('gcModifiedOverride')
  })

  it('should have alt date override set', function () {
    data.meta.alt['gcModifiedOverride'].should.be.a('string').and.not.equal('')
  })

  it('should have the same date override for both languages', function () {
    data.meta['gcModifiedOverride'].should.equal(data.meta.alt['gcModifiedOverride'])
  })

})

/*
function (d) {
    if (d.wp) {
        var a = moment(new Date(d.jcr['gcModifiedOverride'] || d.jcr['gcIssued'] || d.jcr['gcLastPublished'])).format('LLL')
        var b = moment(d.wp['date']).format('LLL')
        assert(a === b, 'Metadata: Date does not match WordPress: ' + b)
        pass('Metadata: Date was migrated properly')
    }
},
*/