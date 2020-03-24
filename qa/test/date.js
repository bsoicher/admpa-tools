/* global describe, before, it, data */


describe('testing', function() {

  it('blank test should be skipped')
  it('second blank test should be skipped')


  it('"hello world" should be 11 characters', function () {
    'hello world'.should.have.lengthOf(11)
  })

  it('"hello world" should be 12 characters?', function () {
    'hello world'.should.have.lengthOf(12)
  })
  
})

/**
 * Date related tests
 */
describe('Date modified override', function () {

  it('should have date override enabled', function () {
    data.jcr.should.have.own.property('gcModifiedIsOverridden', 'true')
    data.jcr.should.have.own.property('gcModifiedOverride')
  })

  it('should have date override set', function () {
    data.jcr['gcModifiedOverride'].should.be.a('string').and.not.equal('')
  })

  it('should have alt date override enabled', function () {
    data.jcr_alt.should.have.own.property('gcModifiedIsOverridden', 'true')
    data.jcr_alt.should.have.own.property('gcModifiedOverride')
  })

  it('should have alt date override set', function () {
    data.jcr_alt['gcModifiedOverride'].should.be.a('string').and.not.equal('')
  })

  it('should have the same date override for both languages', function () {
    data.jcr['gcModifiedOverride'].should.equal(data.jcr_alt['gcModifiedOverride'])
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