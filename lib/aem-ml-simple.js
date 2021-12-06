/**
 * Efficient AEM data loader
 * @author Ben Soicher
 */

(function (root, $, async) {

  var re = {
    // Node path format
    norm: /(^|\/)(en|fr)($|\/[^\.?]*)/,
    trim: /(^\/|\/$)/g,
  }

  // Add/extend node data
  function insert(data) {
    if (data) {
      if (Array.isArray(data)) {
        data.forEach(insert)
      } else if (aem.data[data.path]) {
        $.extend(aem.data[data.path], data)
      } else {
        aem.data[data.path] = data
      }
    }
  }

  // Options formatters
  var opts = {
    root: function (url) {
      return { url: aem.domain + aem.normalize(url) + '.sitemap.xml', dataType: 'xml json' }
    },
    feed: function (url) {
      return { url: aem.domain + url.trim(re.trim) }
    },
    meta: function (url) {
      return { url: aem.domain + aem.normalize(url) + '/jcr:content.json', timeout: 5000 }
    }
  }

  // DataType conversion
  var converters = {
    'xml json': function (xml) {
      return $('url', xml).map(function () {
        return {
          path: aem.normalize(this.firstChild.textContent),
          lastmod: Date.parse(this.lastChild.textContent) / 1000
        }
      }).get()
    },

    'text json': function (text) {
      var json = JSON.parse(text)

      if (json.gcGuid) {
        $.extend(json, {
          peer: aem.normalize(json.gcAltLanguagePeer),
          gcIssued: Date.parse(json.gcIssued) / 1000,
          gcLastPublished: Date.parse(json.gcLastPublished) / 1000,
          gcModifiedOverride: Date.parse(json.gcModifiedOverride) / 1000,
        })
      }

      if (json.data && Array.isArray(json.data)) {
        return json.data.map(function (a) {
          if (a[1] === '') {
            return null
          }
          var title = $(a[1])

          return {
            path: aem.normalize(title.attr('href')),
            live: [
              a[0].replace('{a}', '/content/dam/dnd-mdn/images/maple-leaf'),
              title.text(),
              a[2],
              a[3],
              typeof a[4] === 'string' ? Math.floor(Date.parse(a[4]) / 1000) : a[4],
              a[5] || 0
            ]
          }
        })
      }

      return json
    }
  }

  // Create a queue to send requests
  var q = async.queue(function (opts, cb) {

    // Additional request options
    $.extend(opts, {
      cache: false,
      converters: converters,
      success: function (data) {
        if (!data.path && !Array.isArray(data)) {
          data.path = aem.normalize(opts.url)
        }

        insert(data)
        q.completed++
        cb(null)
      }
    })

    $.get(opts)
  }, 3)

  // Set initial completed count
  q.completed = 0

  var aem = root.aem = {

    // AEM domain
    domain: 'https://www.canada.ca/',

    // Format URL as node path
    normalize: function (url) {
      // Optional pre filter
      if (typeof this.preNormalize === 'function') {
        url = this.preNormalize(url)
      }

      try {
        return url.split('/jcr:content')[0].match(re.norm)[0].replace(re.trim, '')
      } catch (e) {
        throw new Error('Failed to parse node path from "' + url + '"')
      }
    },

    // Stores node data
    data: {},

    // Get path list
    nodes: function () {
      return Object.keys(this.data)
    },

    // Get node count
    length: function () {
      return this.nodes().length
    },

    dateProp: [
      'gcModifiedOverride',
      'gcIssued',
      'gcLastPublished'
    ],

    // Get real node date
    date: function (node, peer) {
      try {
        for (var i = 0; i < this.dateProp.length; i++) {
          var prop = this.dateProp[i]
          if (node[prop] || peer[prop]) {
            return Math.max(node[prop] || 0, peer[prop] || 0)
          }
        }
      } catch (e) {
        throw new Error('Failed to calculate date of "' + path + '"')
      }
    },

    // Filter node list
    filter: function (fn) {
      this.nodes().forEach(function (path) {
        if (!fn(aem.data[path])) {
          delete aem.data[path]
        }
      })
      return this
    },

    // Apply function to each node
    map: function (fn) {
      this.nodes().forEach(function (path) {
        var res = fn(aem.data[path])
        if (typeof res === 'object') {
          aem.data[path] = res
        }
      })
      return this
    },

    // Queue sitemap request(s)
    addRoot: function (url) {
      q.push(Array.isArray(url) ? url.map(opts.root) : opts.root(url))
      return this
    },

    // Queue feed request(s)
    addFeed: function (url) {
      q.push(Array.isArray(url) ? url.map(opts.feed) : opts.feed(url))
      return this
    },

    // Queue metadata request(s)
    meta: function (url) {
      q.push(Array.isArray(url) ? url.map(opts.meta) : opts.meta(url))
      return this
    },

    // Get progress bar values
    progress: function () {
      var total = q.completed + q.length() + q.running()
      return {
        complete: (total === 0 ? 0 : q.completed / total * 100) + '%',
        active: (total === 0 ? 0 : q.running() / total * 100) + '%'
      }
    },

    // Get a promise for completing queue
    wait: q.drain,

  }

}(this, jQuery, async))
