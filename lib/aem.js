/**
 * AEM API
 * @author Ben Soicher
 */

// TODO: Use this: /jcr:content/cq:template.json?_=1234

/* global jQuery */
(function (root, $) {
  // API object
  var AEM = root.AEM = {
    // Base URL
    baseURL: 'https://www.canada.ca/',

    // Node path formatter
    nodeFormat: /(^(https?:\/\/)?(www\.)?canada\.ca|\/content\/canadasite\/|\?.*$|\.html|\/$)/g,

    // Asset path formatter
    assetFormat: /(^(https?:\/\/)?(www\.)?canada\.ca|\?.*$|^\/|\/$)/g,

    // Normalize a URL into a node path
    normalize: function (url) {
      return url.replace(this.nodeFormat, '').replace(/^\//, '')
    },

    // Normalize a URL into an asset path
    normalizeAsset: function (url) {
      return url.replace(this.assetFormat, '')
    },

    // Check if node exists
    exists: function (path, cb) {
      return $.Deferred(function (d) {
        AEM.meta(path).then(function () {
          d.notify(100).resolve(true)
        }, function () {
          d.notify(100).resolve(false)
        })
      }).done(cb).promise()
    },

    // Request peer node path
    peer: function (path, cb) {
      return $.Deferred(function (d) {
        AEM.meta(path, function (meta) {
          d.notify(100).resolve(meta.gcAltLanguagePeer)
        })
      }).done(cb).promise()
    },

    // Request node metadata
    meta: function (path, cb) {
      return this.get({
        url: this.baseURL + this.normalize(path) + '/_jcr_content.json',
        dataType: 'text',
        dataFilter: function (jcr) {
          jcr = JSON.parse(jcr)
          jcr._self = path
          return jcr
        }
      }).done(cb)
    },

    // Request metadata of node and its peer
    metaPair: function (path, cb) {
      return $.Deferred(function (d) {
        AEM.meta(path, function (jcr1) {
          d.notify(50)
          AEM.meta(jcr1.gcAltLanguagePeer, function (jcr2) {
            var obj = {}
            obj[jcr1['jcr:language']] = jcr1
            obj[jcr2['jcr:language']] = jcr2
            d.notify(100).resolve(obj)
          }).fail(d.reject)
        }).fail(d.reject)
      }).done(cb).promise()
    },

    // Request node html, adds domain to absolute URLs
    html: function (path, cb) {
      return this.get({
        url: this.baseURL + this.normalize(path) + '.html',
        dataFilter: function (html) {
          return html.replace(/ (src|href)="\/(?!\/)/ig, ' src="' + AEM.baseURL)
        }
      }).done(cb)
    },

    // Request html of node and its peer
    htmlPair: function (path, cb) {
      return $.Deferred(function (d) {
        AEM.meta(path, function (meta) {
          d.notify(33.33)
          $.when(
            AEM.html(path),
            AEM.html(meta.gcAltLanguagePeer)
          ).done(function (html1, html2) {
            d.notify(100).resolve({
              en: meta['jcr:language'] === 'en' ? html1 : html2,
              fr: meta['jcr:language'] === 'fr' ? html1 : html2
            })
          }).fail(d.reject)
        }).fail(d.reject)
      }).done(cb).promise()
    },

    // Request node descendants
    descendants: function (path, cb) {
      return this.get({
        url: this.baseURL + this.normalize(path) + '.sitemap.xml',
        dataType: 'text',
        dataFilter: function (xml) {
          return $(xml).find('loc').map(function () { return this.innerHTML }).get().slice(1)
        }
      }).done(cb)
    },

    // Request asset metadata
    assetMeta: function (path, cb) {
      return this.get({
        url: this.baseURL + this.normalizeAsset(path) + '/_jcr_content.json',
        dataType: 'text',
        dataFilter: function (jcr) {
          jcr = JSON.parse(jcr)
          jcr._self = path
          return jcr
        }
      }).done(cb)
    },

    // Check if asset exists
    assetExists: function (path, cb) {
      return $.Deferred(function (d) {
        AEM.assetMeta(path).then(function () {
          d.notify(100).resolve(true)
        }, function () {
          d.notify(100).resolve(false)
        })
      }).done(cb).promise()
    },

    // Handle AJAX requests, caching and concurency
    get: (function () {
      var cache = {}
      var stack = []
      var active = 0

      // Retrieve cached request or add to queue
      function get (settings) {
        if (typeof settings === 'string') {
          settings = { url: settings }
        }

        if (!cache[settings.url]) {
          cache[settings.url] = $.Deferred(function (defer) {
            settings.cache = false // Prevent browser cache
            stack.push([defer, settings])
            next()
          }).promise()
        }

        return cache[settings.url]
      }

      // Get/Set # of concurrent requests
      get.limit = 4

      // Delete pending requests
      get.abort = function () {
        stack = []
        active = -1
      }

      // Get # of requests pending
      get.waiting = function () { return stack.length + active }

      // Start next AJAX request if available
      function next () {
        if (stack.length !== 0 && active < get.limit && active >= 0) {
          var task = stack.shift()
          task[0].notify(0)

          $.get(task[1]).then(function (data) {
            task[0].notify(100).resolve(data)
          }, function (xhr, status, err) {
            task[0].notify(100).reject(err)
          }).always(function () {
            active--
            next()
          })

          active++
          next()
        }
      }

      return get
    })()
  }
}(this, jQuery))
