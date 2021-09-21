/* global describe, before, it, data */

describe('Metadata', function () {

  describe('Keywords (Tags)', function () {
    before(function () {
      data.tags = data.keywords ? data.keywords.split(',').map(function (tag) { return tag.trim() }) : []
      data.alt.tags = data.alt.keywords ? data.alt.keywords.split(',').map(function (tag) { return tag.trim() }) : []
    })
  
    it('at least one tag', function () {
      // Test: Article is tagged with at least one tag
      // Why: Articles must be searchable by tags
      // Fix: Add a tag to the keywords (Properties > Mandatory > Descriptive metadata > Keywords)
 
      data.tags.should.not.be.empty
    })
  
    it('same number of tags in both languages', function () {
      // Test: Number of tags matches between languages
      // Why: Both languages must be searchable by same tags
      // Fix: Modify the keywords (Properties > Mandatory > Descriptive metadata > Keywords)
 
      data.tags.length.should.equal(data.alt.tags.length)
    })
  })

  
  describe('Social media (Thumbnail image)', function () {
    before(function () {
      if (!data['og:image'] && !data.alt['og:image']) {
        this.skip() // Skip if thumbnails are not set
      }
    })
  
    it('on both languages', function () {
      // Test: Asset is set on both languages
      // Why: Consistency between languages
      // Fix: Add missing thumbnail
 
      data.should.have.property('og:image')
      data.alt.should.have.property('og:image')
    })
  
    it('same thumbnail for both languages', function () {
      // Test: Same asset for both languages (Does not result in error, only a warning)
      // Why: Ideally images should not have text and be bilingual
      // Fix: Crop out or remove text to make the image bilingual
 
      try {
        data['og:image'].should.equal(data.alt['og:image'])
      } catch (e) {
        this.skip() // Warning only
      }
    })
  
    describe('Location', function () {
      it('in the DAM', function () {
        // Test: Assets are stored in the DAM
        // Why: Easier to find existing assets
        // Fix: Move assets or create copy within the DAM
 
        data['og:image'].should.match(/\/content\/dam\//)
      })
  
      it('in the maple-leaf folder', function () {
        // Test: Assets are stored in the Maple Leaf folder
        // Why: Easier to find existing assets
        // Fix: Move assets or create copy within the Maple Leaf folder
 
        data['og:image'].should.match(/\/content\/dam\/dnd-mdn\/images\/maple-leaf\//)
      })
  
      it('sorted into year and month folders', function () {
        // Test: Assets are well organized
        // Why: Easier to find existing assets
        // Fix: Upload assets into year/month folder structure
 
        data['og:image'].should.match(/\/\d{4}\/\d{2}\//)
      })
    })
  
    describe('Other issues', function () {
      it('JPEG format', function () {
        // Test: Images should be in jpeg format
        // Why: For consistency accross the site
        // Fix: Convert the image to jpeg format
 
        data['og:image'].should.match(/\.jpe?g$/i)
      })
  
      it('not copied from within article', function () {
        // Test: Not AEM generated path (Coppied path from an image within the article)
        // Why: Makes it difficult to determine where an image is saved
        // Fix: Use only the path to the original uploaded asset
 
        data['og:image'].should.not.have.string('/_jcr_content/')
      })
  
      it('does not contain spaces', function () {
        // Test: No spaces in asset path
        // Why: AEM doesnt recognize a path with spaces properly
        // Fix: Rename the file to remove spaces
 
        data['og:image'].should.not.have.string('%20')
      })
    })
  })
 
})
