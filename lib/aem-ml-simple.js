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
  
  
  
  
  
  
    // AEM domain
    var domain = 'https://www.canada.ca/'
  
    // Options formatters
    var opts = {
      root: function (url) {
        return { url: domain + aem.normalize(url) + '.sitemap.xml', dataType: 'xml json' }
      },
      feed: function (url) {
        return { url: domain + url.trim(re.trim) }
      },
      htmlmeta: function (url) {
        return { url: domain + aem.normalize(url) + '.html', dataType: 'html json', timeout: 5000 }
      },
      meta: function (url) {
        return { url: domain + aem.normalize(url) + '/jcr:content.json', timeout: 5000 }
      }
    }
  
    // Data converters
    var converters = {
  
      // root
      'xml json': function (xml) {
        return $('url', xml).map(function () {
          return {
            path: aem.normalize(this.firstChild.textContent),
            lastmod: Date.parse(this.lastChild.textContent) / 1000
          }
        }).get()
      },
  
      // htmlmeta
      'html json': function (html) {
        var obj = {
          peer: aem.normalize(html.match(re.lang)[1]),
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
            return null
          }
  
          return {
            path: aem.normalize(title.attr('href')),
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
          data.path = aem.normalize(opts.url)
        }
  
        insert(data)
        q.completed++
        cb(null)
      }
  
      opts.error = function (xhr, status, err) {
        cb(opts.dataType === 'json' ? null : err)
      }
  
      $.get(opts)
    }, 4)
  
    // Set initial completed count
    q.completed = 0
  
  
  
    // Setup ajax
    $.ajaxSetup({
      cache: false,
      converters: converters
    })
  
  
  
    var aem = root.aem = {
  
      // Format URL as node path
      normalize: function (url) {
        // Optional pre filter
        if (typeof this.preNormalize === 'function') {
          url = this.preNormalize(url)
        }
  
        try {
          return url.split('/jcr:content/')[0].match(re.norm)[0].replace(re.trim, '')
        } catch (e) {
          throw new Error('Failed to parse node path from "' + url + '"')
        }
      },
  
      // Stores node data
      data: {},
  
      // List of node paths
      nodes: function () {
        return Object.keys(this.data)
      },
  
      // Get node count
      length: function () {
        return this.nodes().length
      },
  
      // Remove nodes using filter
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
          aem.data[path] = fn(aem.data[path])
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
  
      // Queue html metadata request(s)
      htmlmeta: function (url) {
        q.push(Array.isArray(url) ? url.map(opts.htmlmeta) : opts.htmlmeta(url))
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
  
      // Expose the drain promise
      wait: q.drain,
  
  
    }
  
  
  
  }(this, jQuery, async))
  