/**
 * Efficient AEM data loader
 * @author Ben Soicher
 */

(function (root, $, async) {

  var re = {
    // Node path format
    norm: /(^|\/)(en|fr)($|\/[^\.?]*)/,
    trim: /(^\/|\/$)/g,

    // HTML parsing
    lang: /<a[^>]+href="(\/[^"]+)"/,
    meta: /<meta[^>]*>/g,
  }

  var aem = root.aem = {
    data: {},
  }

  // Normalize a URL to a node path
  function normalize(url) {
    try {
      return url
        .replace('{e}', '/en/department-national-defence/maple-leaf')
        .replace('{f}', '/fr/ministere-defense-nationale/feuille-derable')
        .split('/jcr:content/')[0].match(re.norm)[0].replace(re.trim, '')
    } catch (e) {
      throw new Error('Failed to parse node path from "' + url + '"')
    }
  }

  // Add/extend node data
  function insert(data) {
    if (Array.isArray(data)) {
      data.forEach(insert)
    } else if (aem.data[data.path]) {
      $.extend(aem.data[data.path], data)
    } else {
      aem.data[data.path] = data
    }
  }

  // Create a queue to send requests
  var q = async.queue(function (opts, cb) {
    opts.success = function (data) {
      if (!Array.isArray(data) && !data.path) {
        data.path = opts.path
        console.log(data)
      }

      insert(data)
      q.completed++
      cb(null)
    }

    opts.error = function (xhr, status, err) {
      cb(err)
    }

    $.get(opts)
  }, 4)

  // Set initial completed count
  q.completed = 0


  // Modify request options
  $.ajaxPrefilter(function (opts) {

    if (opts.path) {
      opts.url = 'https://www.canada.ca/' + opts.path
      opts.crossDomain = true
      opts.cache = false

      switch (opts.dataType) {
        case 'xml json': opts.url += '.sitemap.xml'; break
        case 'html json': opts.url += '.html'; break
        case 'json': opts.url += '/jcr:content/' + opts.prop + '.json'; break
      }

      // Prevent timeout issues
      if (opts.dataType === 'html json' || opts.dataType === 'json') {
        opts.timeout = 5000
      }
    }

    return opts
  })

  // Setup data convertion function
  $.ajaxSetup({
    converters: {

      // JSON Datatable feed
      'text json': function (text) {
        return JSON.parse(text).data.map(function (a) {
          var title = $(a[1])
          return {
            path: normalize(title.attr('href')),
            live: {
              image: a[0].replace('{a}', '/content/dam/dnd-mdn/images/maple-leaf'),
              title: title.text(),
              description: a[2],
              keywords: a[3],
              date: a[4],
              updated: a[5] || 0
            }
          }
        })
      },

      // XML Sitemap
      'xml json': function (xml) {
        return $('url', xml).map(function () {
          return {
            path: normalize(this.firstChild.textContent),
            lastmod: Date.parse(this.lastChild.textContent) / 1000
          }
        }).get()
      },

      // HTML Page
      'html json': function (html) {
        var obj = {
          peer: normalize(html.match(re.lang)[1]),
          html: {}
        }

        $(html.match(re.meta).join()).filter('[name^=dcterms],[name=keywords]').each(function () {
          obj.html[this.name] = this.content
        })

        return obj
      }

    }
  })


  // Get overall progress %
  aem.progress = function () {
    return ((q.completed / (q.completed + q.length() + q.running())) * 100) + '%'
  }

  // Get list of child nodes
  aem.children = function (path) {
    if (Array.isArray(path)) {
      path.forEach(aem.children)
    } else {
      q.push({ path: normalize(path), dataType: 'xml json' })
    }
  }

  // Extract meta from HTML document
  aem.htmlmeta = function (path) {
    if (Array.isArray(path)) {
      path.forEach(aem.htmlmeta)
    } else {
      q.push({ path: normalize(path), dataType: 'html json' })
    }
  }

  // Get metadata field
  aem.meta = function (path, prop) {
    if (Array.isArray(path)) {
      path.forEach(function (path) { aem.meta(path, prop) })
    } else {
      q.push({ path: normalize(path), dataType: 'json', prop: prop })
    }
  }








  aem.feed = function (url) {
    q.push({
      url: url,
      dataType: 'text json'
    })
  }

  aem.feed('https://www.canada.ca/content/dam/dnd-mdn/documents/json/maple-en-2021.json')

  aem.meta([
    'en/department-national-defence/maple-leaf/defence/2021/01/06-dt-news',
    'en/department-national-defence/maple-leaf/defence/2021/11/defending-canada-cognitive-warfare',
    'https://www.canada.ca/en/department-national-defence/maple-leaf/defence/2021/11/institutional-influence-exploring-anti-racism-secretariats.html',
  ], 'jcr:title')


  aem.drain = function (cb) {
    return q.drain(cb)
  }
  /*
    var list = {}
  
    aem.children('en/department-national-defence/maple-leaf/defence/2021/11')
    aem.htmlmeta('en/department-national-defence/maple-leaf/defence/2021/11/acds-message-update-covid-19-vaccination-policy')
    */

  aem.drain(function () {
    console.log(aem.data)
  })


}(this, jQuery, async))
