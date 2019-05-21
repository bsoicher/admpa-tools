
/* global $ */

/**
 * URL of the root node
 * @var {String} ROOT URL
 */
var ROOT = 'https://www.canada.ca/en/department-national-defence/test/maple-leaf/'

/**
 * URL structure of an aticle node (YYYY/MM/article.html)
 * @var {String}
 */
var MATCH = /\/\d{4}\/\d{2}\/[^.]*\.html$/i

/**
 * Global object to hold downloaded metadata
 * @var {Object} DATA
 */
var DATA = {}

/**
 * Get node structure
 * @param {Function} callback
 */
function get_list(callback) {

  var a = $.ajax({

    // Add sitemap extension to root URL
    url: ROOT + '.sitemap.xml',

    // Response will be json once converted
    dataType: 'json',

    // Convert XML response to JSON
    dataFilter: function (data) {
      // Parse XML
      var xml = $.parseXML(data)

      // Create array of paths, ignores nodes without YYYY/MM structure
      var list = $(xml).find('loc').map(function () {
        return MATCH.test(this.innerHTML) ? this.innerHTML : null
      }).get()

      // Convert back to string
      return JSON.stringify(list)
    },

    // Log if an error occured
    error: function () {
      console.log('Failed to load sitemap')
    }
  })

  if ($.isFunction(callback)) {
    a.then(callback)
  }
}

function get_node(url) {

  // Extract language from URL
  var lang = /canada.ca\/fr\//i.test(url) ? 'fr' : 'en'

  $.ajax({

    // URL of JSON node data
    url: url.replace('.html', '/_jcr_content.json'),

    // Process json response
    success: function (json) {
      // Basic node information
      DATA[''].title = json['jcr:title'] || null
      i.desc = json['gcDescription'] || null
      i.keywords = json['gcKeywords'] || null
      i.thumb = json['gcOGImage'] || null

      // Convert date strings to objects
      i.created = new Date(json['jcr:created'])
      i.modified = json['jcr:lastModified'] ? new Date(json['jcr:lastModified']) : null
      i.published = new Date(json['gcLastPublished'])
      i.expires = new Date(json['gcDateExpired'])

      // Create and link alternate node if it has not been created
      if (!i.alt && json['gcAltLanguagePeer']) {
        i.alt = new AEM_Node(json['gcAltLanguagePeer'].replace('/content/canadasite/', 'https://www.canada.ca/'), i)
      }
    },

    // Log if AJAX error occured
    error: function (jqXHR, textStatus, ex) {
      console.log(textStatus + ',' + ex + ',' + jqXHR.responseText)
    }
  })
}





$(function () {
  get_list(function (list) {
    DATA = list
    console.log(list)
  })
})
