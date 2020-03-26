/* global describe, before, it, data */

describe('Thumbnail image', function () {
  before(function () {
    if (!data.meta['gcOGImage'] && !data.meta.alt['gcOGImage']) {
      this.skip() // Skip all if thumbnails are not set
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

  it('should be a path within the DAM', function () {
    data.meta['gcOGImage'].should.match(/^\/content\/dam\//)
  })

  it('should not be an AEM generated image', function () {
    data.meta['gcOGImage'].should.not.match(/\/_jcr_content\//)
  })
})
