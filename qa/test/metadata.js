/* global describe, it, data */

describe('Metadata', function () {

  describe('Social media (thumbnail image)', function () {
    before(function () {
      if (!data.meta['gcOGImage'] && !data.meta.alt['gcOGImage']) {
        this.skip() // Skip if thumbnails are not set
      }
    })
  
    it('should have thumbnail image set on both languages', function () {
      data.meta.should.have.own.property('gcOGImage')
      data.meta.alt.should.have.own.property('gcOGImage')
    })
  
    it('same thumbnail for both languages', function () {
      // Test: Same thumbnail for both languages (Does not result in error, only a warning)
      // Why: Ideally images should not have text and be bilinugal
      // Fix: Crop out or remove text to make the image bilingual
 
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
  
      it('in the maple-leaf folder', function () {
        // What: All Maple Leaf assets should be within the Maple Leaf folder
        // Why: 
        // Fix: Move assets or create copy into the Maple Leaf folder

        data.meta['gcOGImage'].should.match(/^\/content\/dam\/dnd-mdn\/images\/maple-leaf\//)
      })
  
      it('sorted into year and month folders', function () {
        // What: Assets must be organized
        // Why: Easier to find existing assets
        // Fix: Upload assets into year/month folder structure

        data.meta['gcOGImage'].should.match(/\/\d{4}\/\d{2}\//)
      })
    })
  
    describe('Other', function () {
      it('JPEG format', function () {
        // Test: Images should be in jpeg format
        // Why: For consistency accross the site
        // Fix: Convert the image to jpeg format
 
        data.meta['gcOGImage'].should.match(/\.jpe?g$/i)
      })
  
      it('not copied from within article', function () {
        // Test: Not AEM generated path (Coppied path from an image within the article)
        // Why: Makes it difficult to determine where an image is saved
        // Fix: Use only the path to the original uploaded asset
 
        data.meta['gcOGImage'].should.not.have.string('/_jcr_content/')
      })
  
      it('does not contain spaces', function () {
        // Test: No spaces in asset path
        // Why: AEM doesnt recognize a path with spaces properly
        // Fix: Rename the file to remove spaces
 
        data.meta['gcOGImage'].should.not.have.string('%20')
      })
    })
  })

  describe('Search engine indexing', function () {
    it('not disabled', function () {
      // Test: Indexing settings not disabled
      // Why: All articles are indexed
      // Fix: Re-enable search engine indexing (Properties > Optional > Search engine indexing)
      
      data.meta.should.not.have.property('gcNoIndex', 'true')
      data.meta.should.not.have.property('gcNoFollow', 'true')
    })

    it('alternate: not disabled', function () {
      // Test: Indexing settings not disabled
      // Why: All articles are indexed
      // Fix: Re-enable search engine indexing (Properties > Optional > Search engine indexing)
 
      data.meta.alt.should.not.have.property('gcNoIndex', 'true')
      data.meta.alt.should.not.have.property('gcNoFollow', 'true')
    })
  })

  describe('Customization', function () {
    it('no customizations', function () {
      // Test: Customizations not enabled
      // Why: All articles have a standard page layout
      // Fix: Disable customizations (Properties > Customization > Optional)
      
      data.meta.should.not.have.property('hideSearch', 'true')
      data.meta.should.not.have.property('hideMegamenu', 'true')
      data.meta.should.not.have.property('hideBreadcrumb', 'true')
      data.meta.should.not.have.property('fluidWidth', 'true')
      data.meta.should.not.have.property('hideReportProblem', 'true')
      data.meta.should.not.have.property('hideSharePage', 'true')
      data.meta.should.not.have.property('hideAboutGovernment', 'true')
      data.meta.should.not.have.property('hideFooterBanner', 'true')
    })

    it('alternate: no customizations', function () {
      // Test: Customizations not enabled
      // Why: All articles have a standard page layout
      // Fix: Disable customizations (Properties > Customization > Optional)
      
      data.meta.alt.should.not.have.property('hideSearch', 'true')
      data.meta.alt.should.not.have.property('hideMegamenu', 'true')
      data.meta.alt.should.not.have.property('hideBreadcrumb', 'true')
      data.meta.alt.should.not.have.property('fluidWidth', 'true')
      data.meta.alt.should.not.have.property('hideReportProblem', 'true')
      data.meta.alt.should.not.have.property('hideSharePage', 'true')
      data.meta.alt.should.not.have.property('hideAboutGovernment', 'true')
      data.meta.alt.should.not.have.property('hideFooterBanner', 'true')
    })

  })

})
