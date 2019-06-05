
/**
 * Loads
 */

/* global async, $ */

var wordpress_feed = 'https://ml-fd.caf-fac.ca/feed/feed.php'

// Root AEM nodes
var rootEN = 'https://www.canada.ca/en/department-national-defence/test/maple-leaf'
var rootFR = 'https://www.canada.ca/fr/ministere-defense-nationale/test/feuille-derable'

var format = /\/\d{4}\/\d{2}\/[^.]*\.html$/i

// Prevent browser caching
$.ajaxSetup({ cache: false })

// Create an AJAX task
function load (url) {
  return function (cb) {
    $.get(url).done(function (data) {
      data.url = this.url.replace(/[?&]_=\d+/, '')
      cb(null, data)
    })
  }
}

async.parallel([
  // Load sitemaps
  load(rootEN + '.sitemap.xml'),
  load(rootFR + '.sitemap.xml')
]).then(function (maps) {

  var tasks = $(maps[0], maps[1]).find('loc').map(function () {
    return format.test(this.innerHTML) ? load(this.innerHTML.replace('.html', '/_jcr_content.json')) : null
  }).get()

  // Load metadata
  async.parallelLimit(tasks, 2).then(function (data) {
    console.log(data)
  })
})
