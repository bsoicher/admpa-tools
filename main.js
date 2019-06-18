
/* global AEM, download, jQuery, utf8 */

var root = 'en/department-national-defence/test/maple-leaf'

var data = { en: [], fr: [] }

/**
 * Determine if node is an article
 * @param {String} node Node path
 * @returns {Boolean}
 */
function isArticle (node) {
  return /\/\d{4}\/\d{2}\/[^/]+$/i.test(node)
}

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
    utf8.encode(meta['gcKeywords'] || ''),
    utf8.encode(meta['gcDescription'] || ''),
    date.substr(0, 10) + '<em class="hidden">' + date.substr(10) + '</em>'
  ])
}

/**
 * Determine nodes category
 * @param {String} node Node path
 * @returns {String}
 */
function category (node) {
  switch (/(\w+)\/\d{4}\/\d{2}\/[^/]+$/.exec(node).pop()) {
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
 * Save en and fr JSON files
 */
function save () {
  for (var lang in data) {
    download(JSON.stringify({ data: data[lang] }, null, 2), 'maple-' + lang + '.json', 'text/plain;charset=UTF-8;')
  }
}

/**
 * Run the tool
 */
function start () {
  AEM.meta(root, function (meta) {
    AEM.children(root, function (nodes) {
      AEM.children(AEM.normalize(meta['gcAltLanguagePeer']), function (nodes2) {
        nodes.concat(nodes2).filter(isArticle).forEach(function (node) {
          AEM.meta(node, function (meta) {
            prepare(node, meta)
          })
        })
        AEM.done(save)
      })
    })
  })
}
