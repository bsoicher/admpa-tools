
/* global $ */

var baseURL = 'https://www.canada.ca/en/department-national-defence'

/**
 * Get node structure
 * @param {Function} callback
 */
function nodeMap(callback) {

  var a = $.ajax({
    // Site map url
    url: baseURL + '.sitemap.xml',

    // Response will be json once converted
    dataType: 'json',

    // Convert XML response to JSON
    dataFilter: function (data) {

      // Parse XML
      var xml = $.parseXML(data)

      // Create array of URLs
      var list = $(xml).find('loc').map(function () {
        return this.innerHTML
      }).get()

      // Convert back to string
      return JSON.stringify(list)
    },

    success: function (xml) {
      console.log(xml)
    }
  })

  if ($.isFunction(callback)) {
    a.then(callback)
  }
}

$(function(){
  nodeMap(baseURL)
})

