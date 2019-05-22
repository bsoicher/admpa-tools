
/* global $ */

/**
 * URL of the root node
 * @var {String} ROOT URL
 */
var root = 'https://www.canada.ca/en/department-national-defence/test/maple-leaf/'


/**
 * Global object to hold downloaded data
 * @var {Object} DATA
 */
var data = []

function updatePreview() {
  $('#preview').text(JSON.stringify(data, null, 2))
}


/**
 * URL structure to match an aticle node (YYYY/MM/article.html)
 * @var {RegExp}
 */
var structure = /\/\d{4}\/\d{2}\/[^.]*\.html$/i

/**
 * Load article list
 * @param {Function} callback
 * @returns {jqXHR}
 */
function list_articles() {
  console.log('Loading sitemap')

  return $.get({

    // Add sitemap extension to root URL
    url: root + '.sitemap.xml',

    // Response will be JSON once converted
    dataType: 'json',

    // Convert XML response to JSON array
    dataFilter: function (data) {
      // Parse XML
      var xml = $.parseXML(data)

      // Extract URLs, ignores nodes that dont match structure
      var list = $(xml).find('loc').map(function () {
        return structure.test(this.innerHTML) ? this.innerHTML : null
      }).get()

      // Must return as string
      return JSON.stringify(list)
    },

    // Populate global object if succeeded
    success: function (list) {
      data = list
      console.log('Found %d articles', list.length)
    },

    // Log if an error if failed
    error: function () {
      data = []
      console.log('Failed to load sitemap')
    }
  })
}

/**
 * Load node metadata
 * @param {String} url Node URL
 * @return {Object}
 */
function loadNode(url) {

  // Extract language from URL
  var lang = /canada.ca\/fr\//i.test(url) ? 'fr' : 'en'

  return $.ajax({

    // URL of JSON node data
    url: url.replace('.html', '/_jcr_content.json'),

    // Process json response
    success: function (json) {
      // Basic node information
var i ={}
      //DATA[url] = {)
        
        
        //title = json['jcr:title'] || null
      i.desc = json['gcDescription'] || null
      i.keywords = json['gcKeywords'] || null
      i.thumb = json['gcOGImage'] || null

      // Convert date strings to objects
      i.created = new Date(json['jcr:created'])
      i.modified = json['jcr:lastModified'] ? new Date(json['jcr:lastModified']) : null
      i.published = new Date(json['gcLastPublished'])
      i.expires = new Date(json['gcDateExpired'])

      i.alt = json['gcAltLanguagePeer']
      
    },

    // Log if AJAX error occured
    error: function (jqXHR, textStatus, ex) {
      console.log(textStatus + ',' + ex + ',' + jqXHR.responseText)
    }
  })
}




