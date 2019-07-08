
/* global AEM, download, jQuery, utf8, async */

/**
 * Process a node into final format
 * @param {String} node Node path
 * @param {Object} meta Node metadata
 */
function prepare (node, meta) {
  var date = new Date(meta['gcModifiedOverride'] || meta['gcIssued'] || meta['gcLastPublished']).toISOString()
  data[meta['jcr:language']].push([
    category(node),
    meta['gcOGImage'] ? '<img src="' + meta['gcOGImage'] + '"/>' : '',
    '<a href="/' + node + '.html">' + utf8.encode(meta['jcr:title']) + '</a>',
    utf8.encode(meta['gcKeywords'] || '').replace(/,(\S)/g, ', $1'),
    utf8.encode(meta['gcDescription'] || ''),
    date.substr(0, 10) + '<em class="hidden">' + date.substr(10) + '</em>'
  ])
}

/**
 * Create a task containting an AJAX request
 * @param {String} url Document to load
 * @returns {Function}
 */
function get (url) {
  return function (cb) {
    jQuery.get({
      url: url,
      cache: false,
      success: function (res) {
        cb(null, res)
      },
      error: function (e) {
        cb(e, null)
      }
    })
  }
}

/**
 * Determine category of URL
 * @param {String} url Node url
 * @returns {String}
 */
function category (url) {
  switch (/(\w+)\/\d{4}\/\d{2}\/[^/]+$/.exec(url).pop()) {
    case 'navy':
    case 'marine':
      return 'rcn'
    case 'army':
    case 'armee':
      return 'ca'
    case 'rcaf':
    case 'arc':
      return 'rcaf'
  }
  return 'ml'
}

/**
 * Run the tool
 */
function start () {

  // Perform functions in sequence
  async.waterfall([

    // Load WordPress export and sitemaps
    function (cb) {
      async.parallel([
        get('https://ml-fd-staging.caf-fac.ca/wp-content/themes/canada/migrate.php'),
        get('https://www.canada.ca/en/department-national-defence/maple-leaf.sitemap.xml'),
        get('https://www.canada.ca/fr/ministere-defense-nationale/feuille-derable.sitemap.xml')
      ], function (err, res) {
        cb(err, res[0], res[1], res[2])
      })
    },

    // Parse sitemaps
    function (data, en, fr, cb) {
      var nodes = jQuery([en, fr]).find('loc').map(function () {
        return this.innerHTML
      }).get().filter(function (url) {
        return /\/2019\/\d{2}\/[^/]+$/i.test(url)
      })

      cb(null, data, nodes)
    },

    // Download all metadata
    function (data, nodes, cb) {
      async.parallelLimit(nodes.map(function (url) {
        return get(url.replace('.html', '/_jcr_content.json'))
      }), 5, function (err, meta) {
        cb(err, data, meta)
      })
    },

    // Process metadata
    function (data, meta, cb) {
      console.log(meta)
    }

  ], function (e, data) {
    for (var lang in data) {
      download(JSON.stringify({ data: data[lang] }, null, 2), 'maple-' + lang + '.json', 'text/plain;charset=UTF-8;')
    }
  })
}
