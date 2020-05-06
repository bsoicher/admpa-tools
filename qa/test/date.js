/* global describe, it, data */

describe('Date', function () {

  describe('Modified override', function () {

    it('should have date override enabled', function () {
      // Override checkbox must be checked
      data.meta.should.have.own.property('gcModifiedIsOverridden', 'true')
    })

    it('should have date override set', function () {
      // Override date field must be set
      data.meta.should.have.own.property('gcModifiedOverride')
      data.meta['gcModifiedOverride'].should.be.a('string').and.not.equal('')
    })

    it('should have alt date override enabled', function () {
      // What: Alternate language override date must be set
      // Why: To ensure the table order is accurate
      // Fix: Set the alternate language date (Properties > Mandatory > Dates > Overwrite the date modified)
      
      data.meta.alt.should.have.own.property('gcModifiedIsOverridden', 'true')
    })

    it('set on alternate language', function () {
      // What: Alternate language override date is required
      // Why: To ensure the table order is accurate
      // Fix: Set the alternate language date (Properties > Mandatory > Dates > Date Modified Override)
      
      data.meta.alt.should.have.property('gcModifiedOverride')
      data.meta.alt['gcModifiedOverride'].should.be.a('string').and.not.equal('')
    })

    it('matches between languages', function () {
      // What: Node dates must match exactly (to the minute)
      // Why: To ensure the table order matches between languages
      // Fix: Compare the two override dates and use the one which is older for both nodes
      
      data.meta.should.have.property('gcModifiedOverride')
      data.meta.alt.should.have.property('gcModifiedOverride')
      
      var a = new Date(data.meta['gcModifiedOverride']).setSeconds(0)
      var b = new Date(data.meta.alt['gcModifiedOverride']).setSeconds(0)
      
      a.should.equal(b)
    })

  })

  //it('should have byline with same date')
})
