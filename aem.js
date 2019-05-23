
/* global $ */

/**
 * URL of the root node
 * @var {String} ROOT URL
 */
var root = 'https://www.canada.ca/en/department-national-defence/test/maple-leaf'

/**
 * Global object to hold downloaded data
 * @var {Object} DATA
 */
var data = []

/**
 * URL structure to match an aticle node (YYYY/MM/article.html)
 * @var {RegExp}
 */
var structure = /\/\d{4}\/\d{2}\/[^.]*\.html$/i

var completed = 0

/**
 * Load article list
 * @returns {jqXHR}
 */
function loadList () {
  // Clear any previous data
  data = []
  
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

    // Populate data list with objects
    success: function (list) {
      list.forEach(function (url) {
        data.push({ url: url })
      })

      //data = data.slice(1, 50)
      $('#total').text(data.length * 2)
    },

    // Log if failed
    error: function () {
      data = []
    }
  })
}

/**
 * Load node metadata
 * @param {String} url Node URL
 * @param {Number} index location in data array
 * @return {Object}
 */
function loadNode (index) {
  var url = data[index].url || false
  var alt = data[index].alt || false

  if (url) {
    // Loading primary
    delete data[index].url
  } else if (alt) {
    // Loading alternative
    delete data[index].alt
  } else {
    // Nothing to load
    return false
  }

  // Extract language from URL
  var lang = /canada.ca\/fr\//i.test(url || alt) ? 'fr' : 'en'

  return $.get({

    // URL of JSON node data
    url: (url || alt).replace('.html', '/_jcr_content.json'),

    // Filter and format JSON response
    dataFilter: function (data) {
      data = JSON.parse(data)

      // Remap object keys
      var obj = {}
      obj['title-' + lang] = '<a href="' + (url || alt) + '">' + utf8.encode(data['jcr:title']) + '</a>'
      obj['desc-' + lang] = utf8.encode(data['gcDescription'])
      obj['keywords-' + lang] = utf8.encode(data['gcKeywords'])
      obj['published'] = data['gcLastPublished']
      obj['thumb'] = data['gcOGImage']

      if (!alt) {
        obj['alt'] = data['gcAltLanguagePeer'].replace('/content/canadasite/', 'https://www.canada.ca/')
      }

      // Must return as string
      return JSON.stringify(obj)
    },

    // Populate global object
    success: function (json) {
      $.extend(data[index], json)
      completed++
      $('#done').text(completed)
    },

    // Remove if an error occured
    error: function (jqXHR, textStatus, ex) {
      console.warn('Failed to load: %s', url || alt)
      delete data[index]
    }
  })
}



function loadNodes () {

  // If loading too many requests, wait
  for (var x = 0; x < data.length; x++) {
    if (data[x].url) {
      return loadNode(x)
    }
  }

  for (var x = 0; x < data.length; x++) {
    if (data[x].alt) {
      return loadNode(x)
    }
  }

  clearInterval(interval)
  console.log(data)
}

var interval = null

function start() {
  loadList().done(function () {
    interval = setInterval(loadNodes, 100)
  })
}
