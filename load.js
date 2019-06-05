
/**
 * Loads
 */

/* global async, $ */

var wordpress_feed = 'https://ml-fd.caf-fac.ca/feed/feed.php'

// Root AEM nodes

var rootEN = 'https://www.canada.ca/en/department-national-defence'
var rootFR = 'https://www.canada.ca/fr/ministere-defense-nationale/test/feuille-derable'


var format = /\/\d{4}\/\d{2}\/[^.]*\.html$/i

/**
 * Holds all the downloaded data
 * @var {Object[]}
 */
var data = []

// Prevent browser caching
$.ajaxSetup({ cache: false })

/**
 * Get metadata URL of a node
 * @param {String} node HTML URL
 * @returns {String}
 */
function metaURL (node) {
  return node.replace('.html', '/_jcr_content.json').replace('/content/canadasite/', 'https://www.canada.ca/')
}

/**
 * Create AJAX task(s) from url(s)
 * @param {String|String[]} url URL to download
 * @returns {Function|Function[]}
 */
function taskify (url) {
  if (typeof url === 'string') {
    return function (cb) {
      $.get(url).done(function (data) {
        cb(null, data)
      })
    }
  } else {
    return url.map(taskify)
  }
}

/**
 * Convert sitemap(s) to list of meta URLs
 * @param {Document|Document[]} xml XML document
 * @returns {String[]}
 */
function sitemap (xml) {
  return $(xml).find('loc').map(function () {
    return format.test(this.innerHTML) ? metaURL(this.innerHTML) : null
  }).get()
}


async.parallel(taskify([
  // Load sitemaps
  rootEN + '.sitemap.xml',
  rootFR + '.sitemap.xml'
])).then(function (xml) {
  // Process sitemaps
  var nodes = taskify(sitemap(xml))
  async.parallelLimit(nodes, 5).then(function (meta) {
    data = meta

    console.log(data)
  })
})
