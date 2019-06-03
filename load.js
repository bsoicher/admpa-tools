
/**
 * Loads
 */

/* global $ */

var wordpress_feed = 'https://ml-fd.caf-fac.ca/feed/feed.php'

// Root AEM nodes
var root_en = 'https://www.canada.ca/en/department-national-defence/test/maple-leaf'
var root_fr = 'https://www.canada.ca/fr/ministere-defense-nationale/test/feuille-derable'

// Prevent cache by adding random parameter to all requests
$.ajaxSetup({
  beforeSend: function (xhr, config) {
    config.url += (config.url.indexOf('?') !== -1 ? '&' : '?') + 'random=' + Math.random()
  }
})

var format = /\/\d{4}\/\d{2}\/[^.]*\.html$/i

var urls = []

// Load wordpress feed
var wordpress = $.get('https://ml-fd-staging.caf-fac.ca/wp-content/themes/canada/migrate.php')

var sitemaps = $.when(
  // Load english and french sitemaps
  $.get(root_en + '.sitemap.xml'),
  $.get(root_fr + '.sitemap.xml')
).done(function (en, fr) {
  // Filter out non articles and convert to an array
  urls = $(en[0], fr[0]).find('loc').map(function () {
    return format.test(this.innerHTML) ? this.innerHTML : null
  }).get()
})




$.when(sitemaps, wordpress).done(function(s,w){
    console.log('wp and sitemaps loaded')
    console.log(w)
})