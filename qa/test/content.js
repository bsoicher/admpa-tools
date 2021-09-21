/* global describe, it, data */

describe('Content links', function () {

  it('no links to old Maple Leaf', function () {
    // Test: No links to old Maple Leaf (ml-fd.caf-fac.ca)
    // Why: It will be archived and removed from the web at some point
    // Fix: Remove links to caf-fac.ca where possible

    data.doc.find('a[href*="ml-fd.caf-fac.ca"').should.have.lengthOf(0)
  })

  //it('should identify links to intranet content')

  //it('should identify links to canada.ca intranet')

  it('year/month breadcrumbs are hidden', function () {
    // Test: Year/Month nodes do not have landing pages and should be hidden
    // Why: Year and Month nodes are pseudo nodes and do not have landing pages
    // Fix: TBD

    data.doc.find('ol.breadcrumb>li:last').text().should.not.match(/^\d+$/)
  })

})

