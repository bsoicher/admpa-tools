/**
 * AEM API
 * @author Ben Soicher
 */

// TODO: Use this: /jcr:content/cq:template.json?_=1234

/* global jQuery */
(function (root, $) {
  // API object
  var AEM = root.AEM = {

    // Node path formatter
    nodeFormat: /(^(https?:\/\/)?(www\.)?canada\.ca|\/content\/canadasite\/|\?.*$|\.html|\/$)/g,

    // Asset path formatter
    assetFormat: /(^(https?:\/\/)?(www\.)?canada\.ca|\?.*$|^\/|\/$)/g,

    // Normalize a URL into a node path
    normalize: function (url) {
      return 'https://www.canada.ca/' + url.replace(this.nodeFormat, '').replace(/^\//, '')
    },

    // Normalize a URL into an asset path
    normalizeAsset: function (url) {
      return 'https://www.canada.ca/' + url.replace(this.assetFormat, '')
    },




    // Request node metadata
    meta: function (path, prop, cb) {
      return AEM.get({
        url: AEM.normalize(path) + '/jcr:content/' + prop + '.json',
        dataType: 'text',
        dataFilter: function (v) { return JSON.parse(v)[prop] },
      }).done(cb)
    },

    metaPair: function (path, prop, cb) {
      return $.Deferred(function (d) {
        AEM.peer(path, function (peer) {
          $.when(
            AEM.meta(path, prop),
            AEM.meta(peer, prop),
          ).done(function (a, b) {
            d.notify(100).resolve(a, b)
          })
        })
      }).done(cb).promise()
    },

    // Request peer node path
    peer: function (path, cb) {
      return AEM.meta(path, 'gcAltLanguagePeer', cb)
    },

    // Get page date (comparing with peer values)
    date: function (path, cb) {
      return $.Deferred(function (d) {
        AEM.metaPair(path, 'gcModifiedOverride', function (n, p) {
          if (n || p) {
            d.notify(100).resolve(datemax(n, p))
          } else {
            AEM.metaPair(path, 'gcIssued', function (n, p) {
              if (n || p) {
                d.notify(100).resolve(datemax(n, p))
              } else {
                AEM.metaPair(path, 'gcLastPublished', function (n, p) {
                  d.notify(100).resolve(n || p ? datemax(n, p) : null)
                });
              }
            })
          }
        })
      }).done(cb).promise()
    },




    // Request node html
    html: function (path, cb) {
      return AEM.get(AEM.normalize(path) + '.html').done(cb)
    },

    // Extract meta from html
    htmlMeta: function (path, cb) {
      return $.Deferred(function (d) {
        AEM.html(path, function (html) {
          var obj = { path: path }
          html.match(/<meta[^>]*>/g).forEach(function (e) {
            var name = /(name|property)="([^"]*)"/.exec(e)
            var value = /content="([^"]*)"/.exec(e)
            if (name && value) { obj[name[2]] = value[1] }
          })
          d.notify(100).resolve(obj)
        })
      }).done(cb).promise()
    },

    // Extract peer from html
    htmlPeer: function (path, cb) {
      return $.Deferred(function (d) {
        AEM.html(path, function (html) {
          d.notify(100).resolve(/<a[^>]+href="(\/[^"]+)"/.exec(html)[1])
        })
      }).done(cb).promise()
    },

    // Get html meta from both languages
    htmlMetaPair: function (path, cb) {
      return $.Deferred(function (d) {
        AEM.htmlPeer(path, function (peer) {
          $.when(
            AEM.htmlMeta(path),
            AEM.htmlMeta(peer)
          ).done(function (a, b) {
            d.notify(100).resolve(a, b)
          })
        })
      }).done(cb).promise()
    },




    // Request node descendants
    descendants: function (path, cb) {
      return AEM.get({
        url: AEM.normalize(path) + '.sitemap.xml',
        dataType: 'text',
        dataFilter: function (xml) {
          return $(xml).find('loc').map(function () { return this.innerHTML }).get().slice(1)
        }
      }).done(cb)
    },

    // Request asset metadata
    assetMeta: function (path, cb) {
      return AEM.get({
        url: AEM.normalizeAsset(path) + '/_jcr_content.json',
        dataType: 'text',
        dataFilter: function (jcr) {
          jcr = JSON.parse(jcr)
          jcr._self = path
          return jcr
        }
      }).done(cb)
    },

    // Handle AJAX requests, caching and concurency
    get: (function () {
      var cache = {}
      var stack = []
      var active = 0

      // Retrieve cached request or add to queue
      function get(settings) {
        if (typeof settings === 'string') {
          settings = { url: settings }
        }

        if (!cache[settings.url]) {
          cache[settings.url] = $.Deferred(function (d) {
            settings.cache = false // Prevent browser cache
            stack.push([d, settings])
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
      function next() {
        if (stack.length !== 0 && active < get.limit && active >= 0) {
          var task = stack.shift()
          task[0].notify(0)

          $.get(task[1]).then(function (data) {
            task[0].notify(100).resolve(data)
          }, function (xhr, status, err) {
            task[0].notify(100).resolve(null)
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

  // Determine newer date
  function datemax(a, b) {
    a = new Date(a || null)
    b = new Date(b || null)
    return a > b ? a : b
  }

}(this, jQuery))
