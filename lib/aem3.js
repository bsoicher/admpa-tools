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
        timeout: 5000,
        dataFilter: function (v) {
          try {
            return JSON.parse(v)[prop]
          } catch (e) {
            return null
          }
        },
      }).done(cb)
    },







    metaPair: function (path, prop, cb) {
      return $.Deferred(function (d) {
        AEM.htmlPeer(path, function (peer) {
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
      return AEM.get({
        url: AEM.normalize(path) + '.html',
        timeout: 5000,
        dataFilter: function (html) { return html.replace(/\s{2,}/g, ' ') }
      }).done(cb)
    },

    // Extract meta from html
    htmlMeta: function (path, cb) {
      return $.Deferred(function (d) {
        AEM.html(path, function (html) {
          var obj = { path: path.replace('https://www.canada.ca/', '/') }
          try {
            obj.peer = /<a[^>]+href="(\/[^"]+)"/.exec(html)[1]
            html.match(/<meta[^>]*>/g).forEach(function (e) {
              var name = /(name|property)="([^"]*)"/.exec(e)
              var value = /content="([^"]*)"/.exec(e)
              if (name && value) { obj[name[2]] = $.trim(value[1]) }
            })
            obj.html = html
            d.notify(100).resolve(obj)
          } catch (e) {
            d.notify(100).resolve(obj)
          }
        })
      }).done(cb).promise()
    },


    // Extract peer from html, or fallback to meta
    htmlPeer: function (path, cb) {
      return $.Deferred(function (d) {
        AEM.html(path, function (html) {
          try {
            var peer = /<a[^>]+href="(\/[^"]+)"/.exec(html)[1]
            d.notify(100).resolve(peer)
          } catch (e) {
            AEM.peer(path, function (peer) {
              d.notify(100).resolve(peer)
            })
          }
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

    // Handle AJAX requests
    get: (function () {
      var stack = []
      var active = 0

      // Retrieve cached request or add to queue
      function get(settings) {
        // Allow string input
        if (typeof settings === 'string') {
          settings = { url: settings }
        }

        // Prevent browser cache
        settings.cache = false

        // Create deferred
        return $.Deferred(function (d) {
          d.settings = settings
          stack.push(d)
          next()
        }).promise()
      }

      // Start next AJAX request if available
      function next() {
        if (stack.length !== 0 && active < 4 && active >= 0) {
          var task = stack.shift()
          task.notify(0)

          $.get(task.settings).then(function (data) {
            task.notify(100).resolve(data)
          }, function () {
            task.notify(100).resolve(null)
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
