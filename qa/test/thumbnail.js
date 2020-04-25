/* global describe, before, it, data */

describe('Thumbnail image', function () {
  before(function () {
    if (!data.meta['gcOGImage'] && !data.meta.alt['gcOGImage']) {
      this.skip() // Skip if thumbnails are not set
    }
  })

  it('should have thumbnail image set on both languages', function () {
    data.meta.should.have.own.property('gcOGImage')
    data.meta.alt.should.have.own.property('gcOGImage')
  })

  it('should be the same thumbnail for both languages', function () {
    try {
      data.meta['gcOGImage'].should.equal(data.meta.alt['gcOGImage'])
    } catch (e) {
      this.skip() // Warning only
    }
  })

  describe('Location', function () {
    it('in the DAM', function () {
      // Assets must be stored in the the DAM
      data.meta['gcOGImage'].should.match(/^\/content\/dam\//)
    })

    it('in the maple-Leaf folder', function () {
      // Assets must be in the maple-leaf/articles folder
      data.meta['gcOGImage'].should.match(/^\/content\/dam\/dnd-mdn\/images\/maple-leaf\//)
    })

    it('sorted into year and month folders', function () {
      // Asset organization helps navigating through AEM
      data.meta['gcOGImage'].should.match(/\/\d{4}\/\d{2}\//)
    })
  })

  describe('Other', function () {
    it('is JPEG format', function () {
      // For consistency accross the site
      data.meta['gcOGImage'].should.match(/\.jpe?g$/i)
    })

    it('not copied from within article', function () {
      // Causes issues with linking to them. The path to the original image is needed
      data.meta['gcOGImage'].should.not.have.string('/_jcr_content/')
    })

    it('does not contain spaces', function () {
      // Spaces in file names seems to cause issues
      data.meta['gcOGImage'].should.not.have.string('%20')
    })
  })
})
