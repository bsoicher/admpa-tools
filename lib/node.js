/**
 * Efficient AEM data loader
 * @author Ben Soicher
 */

(function (root, $, EE, async) {

  // Instance of EventEmitter
  var aem = root.aem = new EE()

  // Node path format
  var normal = /(?<=^|\/)(en|fr)($|\/[^\.?]*)/

  // Normalize a URL to a node path
  aem.normalize = function (url) {
    try {
      return normal.exec(url)[0]
    } catch (e) {
      throw new Error('Failed to parse node path from "' + url + '"')
    }
  }

  // Add data conversion options
  $.ajaxSetup({
    converters: {

      // XML Sitemaps
      'xml json': function (xml) {
        return $('url', xml).map(function () {
          var url = $(this)
          return {
            path: aem.normalize(url.find('loc').text()),
            lastmod: Date.parse(url.find('lastmod').text()) / 1000
          }
        }).get()
      },

      // HTML documents
      'html json': function (html) {
        var obj = {
          peer: aem.normalize(/<a[^>]+href="(\/[^"]+)"/.exec(html)[1])
        }

        html.match(/<meta[^>]*>/g).forEach(function (e) {
          var name = /(name|property)="([^"]*)"/.exec(e)
          //if (metafields.includes(name[2])) {
          var value = /content="([^"]*)"/.exec(e)
          if (value) { obj[name[2]] = value[1].trim() }
          // }
        })

        return obj
      }
    }
  })





  // Create an request queue
  var q = async.queue(function (opts, cb) {

    // Prevent browser cache
    opts.cache = false


    var r = $.get(opts)


    r.then(function (data) {
      cb(null, data)

      console.log(data)
      data = Date.parse(data['gcIssued']) / 1000
      console.log(data)
    }, function (xhr, status, err) {
      cb(err, null)
    })

  })



  aem.get = function (opts) {
    if (typeof opts === 'string') {
      opts = { url: opts }
    }

    q.push(opts)
    return aem
  }












  aem.children = function (path) {
    return aem.get({
      url: 'https://www.canada.ca/' + aem.normalize(path) + '.sitemap.xml',
      dataType: 'xml json'
    })
  }

  aem.htmlmeta = function (path) {
    return aem.get({
      url: 'https://www.canada.ca/' + aem.normalize(path) + '.html',
      dataType: 'html json',
      timeout: 5000,
    })
  }

  aem.meta = function (path, prop) {
    return aem.get({
      url: 'https://www.canada.ca/' + aem.normalize(path) + '/jcr:content/' + prop + '.json',
      timeout: 5000,
    })
  }




  aem.children('en/department-national-defence/maple-leaf/defence/2021/11/')


}(this, jQuery, EventEmitter, async))
