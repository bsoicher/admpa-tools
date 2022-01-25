/**
 * Efficient AEM data loader
 * @author Ben Soicher
 */

(function (root, $, async) {

  var re = {
    // Node path format
    norm: /(^|\/)(en|fr)($|\/[^\.?]*)/,
  }

  // Options formatters
  var opts = {
    root: function (url) {
      return { url: aem.domain + aem.normalize(url) + '.sitemap.xml', dataType: 'xml json' }
    },
    meta: function (url) {
      return { url: aem.domain + aem.normalize(url) + '/jcr:content.json', timeout: 5000 }
    },
    assetMeta: function (url) {
      return { url: aem.domain + url.replace(/^\//, '') + '/jcr:content.json', cache: false }
    },
    html: function (url) {
      return { url: aem.domain + aem.normalize(url) + '.html', dataType: 'text json', timeout: 10000 }
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
      }).get().reverse()
    },

    'text json': function (text) {

      if (/^<!doctype html>/.exec(text)) {
        text = text.replace(/\s{2,}/g, ' ')

        if (typeof aem.filterHtml === 'function') {
          return { html: aem.filterHtml(text) }
        } else {
          return { html: text }
        }
      }
  
      var json = JSON.parse(text)

      if (json.gcGuid) {
        if (json.gcModifiedIsOverridden !== "true") {
          json.gcModifiedOverride = 0
        }

        return Object.assign(json, {
          peer: aem.normalize(json.gcAltLanguagePeer),
          gcOGImage: (json.gcOGImage || "").trim(),
          'jcr:title': (json['jcr:title'] || "").trim(),
          gcDescription: (json.gcDescription || "").trim(),
          gcKeywords: (json.gcKeywords || "").trim(),
          gcIssued: Date.parse(json.gcIssued) / 1000,
          gcLastPublished: Date.parse(json.gcLastPublished) / 1000,
          gcModifiedOverride: Date.parse(json.gcModifiedOverride) / 1000,
        })
      }

      return json
    },

  }

  // Create a queue to send requests
  var q = async.queue(function (opts, cb) {

    // Additional request options
    Object.assign(opts, {
      cache: false,
      converters: converters,
      success: function (data) {
        if (data.gcGuid || data.html) {
          data.path = aem.normalize(opts.url)
        } else if (aem.preFilter && Array.isArray(data)) {
          data = data.filter(aem.preFilter)
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

    // Format text using placeholders
    format: function (text, reverse) {
      if (aem.placeholders && typeof text === 'string') {
        if (!reverse) {
          text = text.replace(/{\w+}/g, function (key) {
            return aem.placeholders[key] || key;
          })
        } else {
          for (key in aem.placeholders) {
            text = text.replace(new RegExp(aem.placeholders[key], 'g'), key)
          }
        }
      }
      return text
    },

    // Format URL as node path
    normalize: function (url) {
      url = aem.format(url)

      try {
        return url.split('/jcr:content')[0].match(re.norm)[0].replace(/(^\/|\/$)/g, '')
      } catch (e) {
        throw new Error('Failed to parse node path from "' + url + '"')
      }
    },

    // Stores node data
    data: {},

    // Add/extend node data
    _save: function (data) {
      if (typeof data !== 'object') {
        throw new Error('aem._save expected object as input')
      }

      if (Array.isArray(data)) {
        data.forEach(aem._save)
      } else if (aem.data[data.path]) {
        Object.assign(aem.data[data.path], data)
      } else if (data) {
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

    // Synchronize date fields between peers
    dateSync: function () {
      return aem.each(function (node) {
        if (node.peer && aem.data[node.peer].peer) {
          var peer = aem.data[node.peer]
          for (var i = 0; i < aem.dateProp.length; i++) {
            var prop = aem.dateProp[i]
            if (node[prop] || peer[prop]) {
              node[prop] = Math.max(node[prop] || 0, peer[prop] || 0)
              return node
            }
          }
        }
      })
    },

    // Update/Remove nodes
    each: function (fn) {
      aem.nodes().forEach(function (path) {
        if (fn(aem.data[path]) === false) {
          delete aem.data[path]
        }
      })
      return aem
    },

    // Queue sitemap request(s)
    addRoot: function (url) {
      q.push(Array.isArray(url) ? url.map(opts.root) : opts.root(url))
      return aem
    },

    // Queue metadata request(s)
    meta: function (url) {
      q.push(Array.isArray(url) ? url.map(opts.meta) : opts.meta(url))
      return aem
    },
    
    // Queue html request(s)
    html: function (url) {
      q.push(Array.isArray(url) ? url.map(opts.html) : opts.html(url))
      return aem
    },

    // Request asset metadata
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
