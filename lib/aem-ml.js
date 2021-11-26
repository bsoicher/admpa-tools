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






  // AEM domain
  var domain = 'https://www.canada.ca/'

  // Options formatters
  var opts = {
    children: function (url) {
      return { url: domain + normalize(url) + '.sitemap.xml', dataType: 'xml json' }
    },
    htmlmeta: function (url) {
      return { url: domain + normalize(url) + '.html', dataType: 'html json', timeout: 5000 }
    },
    meta: function (url, prop) {
      return { url: domain + normalize(url) + '/jcr:content/' + prop + '.json', timeout: 5000 }
    },
    feed: function (url) {
      return { url: domain + url.trim(re.trim) }
    }
  }

  // Data converters
  var converters = {

    // children
    'xml json': function (xml) {
      return $('url', xml).map(function () {
        return {
          path: normalize(this.firstChild.textContent),
          lastmod: Date.parse(this.lastChild.textContent) / 1000
        }
      }).get()
    },

    // htmlmeta
    'html json': function (html) {
      var obj = {
        peer: normalize(html.match(re.lang)[1]),
        html: {}
      }

      $(html.match(re.meta).join()).filter('[name^=dcterms],[name=keywords]').each(function () {
        obj.html[this.name] = this.content
      })

      return obj
    },

    // meta & feed
    'text json': function (text) {
      var json = JSON.parse(text)

      if (!json.data || !Array.isArray(json.data)) {
        return json
      }

      return json.data.map(function (a) {
        var title = $(a[1])

        var h = title.attr('href')
        if (!h) {
          console.log(a)
        }

        return {
          path: normalize(title.attr('href')),
          live: {
            image: a[0].replace('{a}', '/content/dam/dnd-mdn/images/maple-leaf'),
            title: title.text(),
            description: a[2],
            keywords: a[3],
            date: typeof a[4] === 'string' ? Date.parse(a[4]) / 1000 : a[4],
            updated: a[5] || 0
          }
        }
      })
    }

  }








  // Create a queue to send requests
  var q = async.queue(function (opts, cb) {
    opts.success = function (data) {
      if (!Array.isArray(data) && !data.path) {
        data.path = normalize(opts.url)
      }

      insert(data)
      q.completed += Array.isArray(data) ? 10 : 1
      cb(null, data)
    }

    opts.error = function (xhr, status, err) {
      cb(err)
    }

    $.get(opts)
  }, 4)

  // Set initial completed count
  q.completed = 0

  // Log any errors
  q.error(console.error)





  // Setup ajax
  $.ajaxSetup({
    cache: false,
    converters: converters
  })




  var aem = root.aem = {

    data: {},

    // List of stored nodes
    nodes: function () {
      return Object.keys(this.data)
    },

    // Filter path list
    filter: function (match) {
      this.nodes().forEach(function (path) {
        if (!path.match(match)) {
          delete aem.data[path]
        }
      })
      return this
    },

    // Queue sitemap request(s)
    children: function (url) {
      q.push(Array.isArray(url) ? url.map(opts.children) : opts.children(url))
      return this
    },

    // Queue html metadata request(s)
    htmlmeta: function (url) {
      q.push(Array.isArray(url) ? url.map(opts.htmlmeta) : opts.htmlmeta(url))
      return this
    },

    // Queue metadata request(s)
    meta: function (url, prop) {
      if (typeof prop !== 'string') {
        throw new Error('Meta property must be a string')
      }

      q.push(Array.isArray(url) ? url.map(function (surl) {
        return opts.meta(surl, prop)
      }) : opts.meta(url, prop))

      return this
    },

    // Queue feed request(s)
    feed: function (url) {
      q.push(Array.isArray(url) ? url.map(opts.feed) : opts.feed(url))
      return this
    },

    // Expose the drain
    drain: q.drain,

    // Get progress bar values
    progress: function () {
      var total = q.completed + q.length() + q.running()
      return {
        complete: (total === 0 ? 0 : q.completed / total * 100) + '%',
        active: (total === 0 ? 0 : q.running() / total * 100) + '%'
      }
    }

  }

}(this, jQuery, async))
