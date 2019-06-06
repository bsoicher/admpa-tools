
/**
 * Loads
 */

/* global async, $, utf8 */

var wordpress_feed = 'https://ml-fd.caf-fac.ca/feed/feed.php'

// Root AEM nodes

var rootEN = 'https://www.canada.ca/en/department-national-defence'
var rootFR = 'https://www.canada.ca/fr/ministere-defense-nationale'


var format = /\/\d{4}\/\d{2}\/[^.]*\.html$/i

// Prevent browser caching
$.ajaxSetup({ cache: false })

/**
 * Get JSON URL of a node
 * @param {String} node URL
 * @returns {String}
 */
function metaURL (node) {
  return node.replace('.html', '/_jcr_content.json').replace('/content/canadasite/', 'https://www.canada.ca/')
}

/**
 * Get HTML URL of a node
 * @param {String} node URL
 * @returns {String}
 */
function nodeURL (node) {
  return node.replace('/_jcr_content.json', '.html').replace('.sitemap.xml', '.html')
}

/**
 * Create AJAX task(s) from URL(s)
 * @param {String|String[]} url URL(s) to download
 * @returns {Function|Function[]}
 */
function taskify (url) {
  if (typeof url === 'string') {
    return function (cb) {
      $.get(url).done(function (data) {
        data['_url'] = url
        cb(null, data)
      })
    }
  } else {
    return url.map(taskify)
  }
}

/**
 * Join peer nodes, removing any without one
 * @param {Object[]} nodes Metadata nodes
 * @returns {Object[]}
 */
function peer (nodes) {
  return $.map(nodes, function (obj) {
    if (obj['_peer']) return null

    var peer = nodes.find(function (obj2) {
      if (obj['_url'] !== metaURL(obj2['gcAltLanguagePeer'])) {
        return false
      }
      obj2['_peer'] = true
      return true
    })

    if (!peer) return null
    obj['_peer'] = peer
    return obj
  })
}

/**
 * Get latest date between a nodes date and its peer
 * @param {Object} node Metadata node
 * @param {String} field Meta field to compare
 * @returns {String|Boolean}
 */
function latest (node, field) {
  if (node[field] || node['_peer'][field]) {
    var d1 = new Date(node[field] || 0)
    var d2 = new Date(node['_peer'][field] || 0)
    return (d1 > d2 ? d1 : d2).toISOString()
  }
  return false
}

/**
 * Prepare node for export
 * @param {Object} node Metadata node
 * @returns {Object}
 */
function prepare (node) {
  var obj = {}
  var lang = node['jcr:language']

  obj['img'] = node['gcOGImage'] ? '<img src="' + node['gcOGImage'] + '"/>' : ''
  obj['title-' + lang] = '<a href="' + nodeURL(node['_url']) + '">' + utf8.encode(node['jcr:title']) + '</a>'
  obj['desc-' + lang] = utf8.encode(node['gcDescription'] || '')
  obj['key-' + lang] = utf8.encode(node['gcKeywords'] || '')

  if (typeof node['_peer'] !== 'object') return obj
  $.extend(obj, prepare(node['_peer']))

  var date = latest(node, 'gcModifiedOverride') || latest(node, 'gcLastPublished') || latest(node, 'gcIssued')
  obj['date'] = date.substr(0, 10) + '<em class="hidden">' + date.substr(10) + '</em>'

  return obj
}

// Begin downloads
async.parallel(taskify([
  // Load sitemaps
  rootEN + '.sitemap.xml',
  rootFR + '.sitemap.xml'
])).then(function (xml) {
  // Process sitemaps
  var nodes = $(xml).find('loc').map(function () {
    return format.test(this.innerHTML) ? metaURL(this.innerHTML) : null
  }).get()

  // Load metadata, filter out singles and trigger main
  async.parallelLimit(taskify(nodes), 5).then(function (meta) {
    main(peer(meta))
  })
})

/**
 * Process AEM metadata
 * @param {Object[]} meta The downloaded metadata
 */
function main (meta) {



  meta = meta.map(prepare)
  console.log(meta)

  
}
