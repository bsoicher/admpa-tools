/* global describe, it, data */

describe('Content links', function () {
  it('should not link to old Maple Leaf, it will be archived', function () {
    data.doc.find('a[href*="ml-fd.caf-fac.ca"').should.have.lengthOf(0)
  })

  it('should identify links to intranet content')

  it('should identify links to canada.ca intranet')

  it('year/month breadcrumbs are hidden', function () {
    // Year/Month nodes do not have landing pages and should be hidden
    data.doc.find('ol.breadcrumb>li:last').text().should.not.match(/^\d+$/)
  })

})

/*
 data.doc.find('a[href*=".mil.ca"').get().should.have.lengthOf(0)
 data.doc.find('a[href*="intranet.canada.ca"').get().should.have.lengthOf(0)
 */
