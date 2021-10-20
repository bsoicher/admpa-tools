/* global describe, it, data */

describe('Content', function () {

  describe('Old Maple Leaf', function () {

    it('no links to old Maple Leaf', function () {
      // Test: No links to old Maple Leaf (ml-fd.caf-fac.ca)
      // Why: It has been archived and removed from the web
      // Fix: Remove links to caf-fac.ca
  
      data.doc.find('a[href*="ml-fd.caf-fac.ca"').should.have.lengthOf(0)
    })

    it('no images from old Maple Leaf', function () {
      // Test: No images hosted on old Maple Leaf (ml-fd.caf-fac.ca)
      // Why: It has been archived and removed from the web
      // Fix: Move images into AEM
  
      data.doc.find('img[src*="ml-fd.caf-fac.ca"').should.have.lengthOf(0)
    })

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

