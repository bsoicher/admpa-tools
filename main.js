
/* global download, jQuery, utf8, async */

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
      success: function (res) { cb(null, res) },
      error: function (e) { cb(e, null) }
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

function log (str) {
  jQuery('#log').append(str + '<br/>')
}

/**
 * Run the tool
 */
function start () {

  // Perform functions in sequence
  async.waterfall([

    function (cb) {
      log('Loading WordPress articles and sitemaps...')

      async.parallel([
        get('https://ml-fd-staging.caf-fac.ca/wp-content/themes/canada/migrate.php'),
        get('https://www.canada.ca/en/department-national-defence/maple-leaf.sitemap.xml'),
        get('https://www.canada.ca/fr/ministere-defense-nationale/feuille-derable.sitemap.xml')
      ], function (err, res) {
        cb(err, res[0], [res[1], res[2]])
      })
    },

    function (data, xml, cb) {
      log('Processing sitemaps...')

      var nodes = jQuery(xml).find('loc').map(function () {
        return this.innerHTML
      }).get().filter(function (url) {
        return /\/\d{4}\/\d{2}\/[^/]+$/i.test(url)
      })

      cb(null, data, nodes)
    },

    // Download all metadata
    function (data, nodes, cb) {
      log('Downloading metadata...')

      var tasks = {}
      nodes.forEach(function (url) {
        tasks[url] = get(url.replace('.html', '/_jcr_content.json'))
      })

      async.parallelLimit(tasks, 5, function (err, meta) {
        cb(err, data, meta)
      })
    },

    // Process metadata
    function (data, meta, cb) {
      log('Processing metadata...')

      Object.keys(meta).forEach(function (url) {
        var o = meta[url]
        var date = new Date(o['gcModifiedOverride'] || o['gcIssued'] || o['gcLastPublished']).toISOString()

        data[o['jcr:language']].push([
          category(url),
          o['gcOGImage'] ? '<img src="' + o['gcOGImage'] + '"/>' : '',
          '<a href="' + url.replace('https://www.canada.ca/', '/') + '">' + utf8.encode(o['jcr:title']) + '</a>',
          utf8.encode(o['gcDescription'] || ''),
          utf8.encode(o['gcKeywords'] || '').replace(/,(\S)/g, ', $1'),
          date.substr(0, 10) + '<em class="hidden">' + date.substr(10, 9) + '</em>'
        ])
      })

      cb(null, data)
    }

  ], function (e, data) {
    log('Done')

    for (var lang in data) {
      download(JSON.stringify({ data: data[lang] }, null, null), 'maple-' + lang + '.json', 'text/plain;charset=UTF-8;')
    }
  })
}
