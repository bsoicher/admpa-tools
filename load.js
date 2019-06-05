
/**
 * Loads
 */

/* global $ */

var wordpress_feed = 'https://ml-fd.caf-fac.ca/feed/feed.php'

// Root AEM nodes
var rootEN = 'https://www.canada.ca/en/department-national-defence/test/maple-leaf'
var rootFR = 'https://www.canada.ca/fr/ministere-defense-nationale/test/feuille-derable'

var format = /\/\d{4}\/\d{2}\/[^.]*\.html$/i

var urls = []
var loading = []

var queue = new DownloadQueue()

/**
 * Ajax response cache {url:data}
 * @var {Object}
 */
var cache = {}

$.ajaxSetup({
  // Prevent browser caching
  cache: false,
  // Prevent repeat requests
  beforeSend: function () {
    var url = this.url.replace(/\?_=\d+/, '')
    if (cache.hasOwnProperty(url)) {
      return false
    }
    cache[url] = true
  },
  // Save response data
  success: function (data) {
    cache[this.url.replace(/\?_=\d+/, '')] = data
  },
  // Remove cache on error
  error: function () {
    delete cache[this.url.replace(/\?_=\d+/, '')]
  }
})

$.when(
  // English and French sitemaps
  $.get(rootEN + '.sitemap.xml'),
  $.get(rootFR + '.sitemap.xml')
).done(function (en, fr) {

    console.log(cache)

  // Filter out non articles and convert to an array
  var urls = $(en[0], fr[0]).find('loc').map(function () {
    return format.test(this.innerHTML) ? this.innerHTML : null
  }).get().forEach(function (val) {
    queue.push(val.replace('.html', '/_jcr_content.json'))
  })
})





// Load wordpress feed
//var wordpress = $.get('https://ml-fd-staging.caf-fac.ca/wp-content/themes/canada/migrate.php')

