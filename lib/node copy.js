/**
 * Efficient event based AEM data loader
 * @author Ben Soicher
 */

(function (root, $, EE, d3) {

  // Instance of EventEmitter
  var aem = root.aem = new EE()

  // Create an async queue
  var q = new d3.queue(4)

  // Private request stack
  var stack = []
  var active = 0
  var concurrency = 4

  // Node format regex
  var normal = /(?<=^|\/)(en|fr)($|\/[^\.?]*)/

  var metafields = ['peer', 'dcterms.title', 'description', 'keywords']

  // Normalize a URL as a node path
  aem.normalize = function (url) {
    try {
      return normal.exec(url)[0]
    } catch (e) {
      throw new Error('Failed to parse node path from "' + url + '"')
    }
  }

  // Waiting request count
  aem.length = function () { return stack.length }

  // Is anything running
  aem.idle = function() { return active === 0 && stack.length === 0 }

  // Add callback for errors
  aem.error = function (cb) { return this.on('error', cb, this) }

  // Add callback for completing all requests
  aem.drain = function (cb) { return this.once('drain', cb, this) }

  


  aem.get = function (opts) {
    if (typeof opts === 'string') {
      opts = { url: opts }
    }

    stack.push(opts)
    return aem.emit('next')
  }

  // Clear everything
  aem.kill = function () {
    stack = []
    active = 0
    return aem.removeListener('next')
  }

  var converters = {

    // Extract sitemap list
    'xml json': function (xml) {
      return $(xml).find('url').map(function () {
        var i = $(this)
        return {
          path: aem.normalize(i.find('loc').text()),
          lastmod: Date.parse(i.find('lastmod').text()) / 1000
        }
      }).get()
    },

    // Extract HTML metadata
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


  aem.on('next', function () {
    if (stack.length !== 0 && active < concurrency && active >= 0) {
      var opts = stack.shift()
      var path = aem.normalize(opts.url)

      // Prevent browser cache
      opts.cache = false

      // Add data converter functions
      opts.converters = converters


      $.get(opts).done(function (data) {
        aem.emit('load', data, path)
      }).fail(function (xhr, status, err) {
        aem.emit('error', err, path)
      }).always(function () {
        active--
        aem.emit('next')
      })

      active++
      aem.emit('next')
    }

    if (stack.length === 0 && active === 0) {
      aem.emit('drain')
    }

  })















  aem.children = function (path) {
    return aem.get({
      url: 'https://www.canada.ca/' + aem.normalize(path) + '.sitemap.xml',
      dataType: 'xml json'
    })
  }

  aem.htmlmeta = function (path) {
    return aem.get({
      url: 'https://www.canada.ca/' + aem.normalize(path) + '.html',
      dataType: 'html json'
    })
  }

  console.log(aem.idle())

  aem.htmlmeta('en/department-national-defence/maple-leaf/defence/2021/11/transgender-awareness-week-champion-message.html')

  console.log(aem.idle())



  aem.on('load', function () {
    console.log(arguments)
  })




  aem.drain(function () {
    console.log('Finished')
  })



}(this, jQuery, EventEmitter, d3))
