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
    },
    assetMeta: function (url) {
      return { url: aem.domain + url.trim(re.trim) + '/jcr:content.json' }
    }
  }

  // DataType conversion
  var converters = {

    'xml json': function (xml) {
      return $('url', xml).map(function () {
        return {
          path: aem.normalize(this.firstChild.textContent),
          lastmod: Date.parse(this.lastChild.textContent) / 1000,
        }
      }).get()
    },

    'text json': function (text) {
      var json = JSON.parse(text)

      if (json.gcGuid) {
        return Object.assign(json, {
          peer: aem.normalize(json.gcAltLanguagePeer),
          gcIssued: Date.parse(json.gcIssued) / 1000,
          gcLastPublished: Date.parse(json.gcLastPublished) / 1000,
          gcModifiedOverride: Date.parse(json.gcModifiedOverride) / 1000,
        })
      }

      if (json.data && Array.isArray(json.data)) {
        var list = []
        json.data.forEach(function (a) {
          if (a[1] !== '') {
            var title = $(a[1])

            list.push({
              path: aem.normalize(title.attr('href')),
              live: [
                a[0].replace('{a}', '/content/dam/dnd-mdn/images/maple-leaf'),
                a[1],
                a[2],
                a[3],
                typeof a[4] === 'string' ? Math.floor(Date.parse(a[4]) / 1000) : a[4],
                a[5] || 0
              ]
            })
          }
        })
        return list
      }

      return json
    }
  }

  // Create a queue to send requests
  var q = async.queue(function (opts, cb) {

    // Additional request options
    Object.assign(opts, {
      cache: false,
      converters: converters,
      success: function (data) {
        if (data.gcGuid) {
          data.path = aem.normalize(opts.url)
        }
        aem._save(data)
      },
      complete: function () {
        q.completed++
        cb(null)
      }
    })

    $.get(opts)
  }, 4)

  // Set initial completed count
  q.completed = 0

  var aem = root.aem = {

    // AEM domain
    domain: 'https://www.canada.ca/',

    // Format URL as node path
    normalize: function (url) {
      // Optional pre filter
      if (typeof aem.preNormalize === 'function') {
        url = aem.preNormalize(url)
      }

      try {
        return url.split('/jcr:content')[0].match(re.norm)[0].replace(re.trim, '')
      } catch (e) {
        throw new Error('Failed to parse node path from "' + url + '"')
      }
    },

    // Stores node data
    data: {},

    // Add/extend node data
    _save: function (data) {
      if (typeof data !== 'object' || data === null) {
        throw new Error('aem._save expected object as input')
      }

      if (Array.isArray(data)) {
        data.forEach(aem._save)
      } else if (aem.data[data.path]) {
        Object.assign(aem.data[data.path], data)
      } else {
        aem.data[data.path] = data
      }
    },

    // Get path list
    nodes: function () {
      return Object.keys(aem.data)
    },

    // Get node count
    length: function () {
      return Object.keys(aem.data).length
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
        throw new Error('Failed to calculate date of "' + node.path + '"')
      }
    },

    // Update/Remove nodes
    each: function (fn) {
      aem.nodes().forEach(function (path) {
        var res = fn(aem.data[path])
        if (res === false) {
          delete aem.data[path]
        } else if (res && res.path) {
          aem.data[path] = res
        }
      })
      return aem
    },

    // Queue sitemap request(s)
    addRoot: function (url) {
      q.push(Array.isArray(url) ? url.map(opts.root) : opts.root(url))
      return aem
    },

    // Queue feed request(s)
    addFeed: function (url) {
      q.push(Array.isArray(url) ? url.map(opts.feed) : opts.feed(url))
      return aem
    },

    // Queue metadata request(s)
    meta: function (url) {
      q.push(Array.isArray(url) ? url.map(opts.meta) : opts.meta(url))
      return aem
    },

    assetMeta: function (url) {
      return $.get(opts.assetMeta(url))
    },

    // Get progress bar values
    progress: function () {
      var total = q.completed + q.length() + q.running()
      return {
        complete: (total === 0 ? 0 : q.completed / total * 100) + '%',
        active: (total === 0 ? 0 : q.running() / total * 100) + '%'
      }
    },

    // Passthrough queue functions
    wait: q.drain,
    idle: q.idle,

  }

}(this, jQuery, async))
