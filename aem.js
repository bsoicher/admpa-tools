
/* global $ */

var root = 'https://www.canada.ca/en/department-national-defence/test/maple-leaf'

/**
 * Get node structure
 * @param {Function} callback
 */
function get_list(callback) {

  var a = $.ajax({
    // Site map url
    url: root + '.sitemap.xml',

    // Response will be json once converted
    dataType: 'json',

    // Convert XML response to JSON
    dataFilter: function (data) {

      // Parse XML
      var xml = $.parseXML(data)

      // Create array of paths, ignores nodes without YYYY/MM structure
      var list = $(xml).find('loc').map(function () {
        return /\d{4}\/\d{2}\//.test(this.innerHTML) ? this.innerHTML : null
      }).get()

      // Convert back to string
      return JSON.stringify(list)
    },

    error: function () {
      window.alert('Failed to load sitemap')
    }
  })

  if ($.isFunction(callback)) {
    a.then(callback)
  }
}

$(function () {
  get_list(function(list){
    console.log(list)
  })
})
