
/**
 * Loads
 */

/* global $ */

var wordpress_feed = 'https://ml-fd.caf-fac.ca/feed/feed.php'

// Root AEM nodes
var root_en = 'https://www.canada.ca/en/department-national-defence/test/maple-leaf'
var root_fr = 'https://www.canada.ca/fr/ministere-defense-nationale/test/feuille-derable'

var format = /\/\d{4}\/\d{2}\/[^.]*\.html$/i

var urls = []
var loading = []

var queue = new DownloadQueue()

$.ajaxSetup({
  // Prevent caching
  beforeSend: function (xhr, config) {
    config.url += (config.url.indexOf('?') !== -1 ? '&' : '?') + 'random=' + Math.random()
  },
  // Log ajax errors
  error: function (xhr, status) {
    console.error('ajax error: ' + status)
  }
})

var sitemap = $.when(
  // Wait for english and french version
  $.get(root_en + '.sitemap.xml'),
  $.get(root_fr + '.sitemap.xml')
).done(function (en, fr) {
  // Filter out non articles and convert to an array
  var urls = $(en[0], fr[0]).find('loc').map(function () {
    return format.test(this.innerHTML) ? this.innerHTML : null
  }).get().forEach(function (val) {
    queue.push(val.replace('.html', '/_jcr_content.json'))
  })
})


queue.bind('done', function () {
    console.log('queue finished')
})



// Load wordpress feed
//var wordpress = $.get('https://ml-fd-staging.caf-fac.ca/wp-content/themes/canada/migrate.php')

