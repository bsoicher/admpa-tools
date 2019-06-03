

/* global jQuery */

/**
 * URL of the root node
 * @var {String} ROOT URL
 */
var root = 'https://www.canada.ca/en/department-national-defence/test/maple-leaf'




var queue = new DownloadQueue()

// Wordpress Articles
//queue.push('https://ml-fd.caf-fac.ca/feed/feed.php')

// AEM Sitemap
queue.push({
  url: root + '.sitemap.xml?test=123',
  dataType: 'json',
  dataFilter: filter_xml,

  success: function (list) {
      console.log(list)

  }
})
