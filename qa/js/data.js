
/**
 * Loader of data that will be QA'd
 */
(function (root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory(require('mocha'), require('chai').assert, require('jquery'))
  } else {
    root.data = factory(root.Mocha, root.chai.assert, root.jQuery)
  }
}(this, function (Mocha, assert, $) {

  var start = new Date().getTime()

  // Will be populated
  var data = {}

  // Start downloading data on page load
  $(function () {
    var url = Mocha.utils.parseQuery(window.location.search).url

    // Dont continue if URL is missing
    if (!url) { return }

    // Set input field value
    $('#url').val(url)

    // Validate URL
    try {
      assert(/^https:\/\/www\.canada\.ca\//.test(url), 'URL Error: Must start with <code>https://www.canada.ca/</code>')
      assert(/\.html$/.test(url), 'URL Error: Must have the <code>.html</code> extension')
    } catch (e) {
      $('<div class="alert alert-danger">' + e.message + '</div>').appendTo('#mocha')
      return
    }

    // Try loading node metadata first

    load(url, function (obj) {
      load(obj.peer, function (altobj) {
        window.data = obj
        window.data.alt = altobj
        data.duration = new Date().getTime() - start
      
        console.log(window.data)
        window.run()
      })
    })

  })

  /**
   * Get HTML document of AEM page
   */
  function load(url, cb) {
    return $.Deferred(function (d) {
      $.get({
        cache: false,
        timeout: 5000,
        url: url.replace('/content/canadasite/', 'https://www.canada.ca/'),
        
        success: function (html) {
          var obj = { 
            path: url,
            peer: 'https://www.canada.ca' + /<a[^>]+href="(\/[^"]+)"/.exec(html)[1],
            doc: $(html)
          }
  
          html.match(/<meta[^>]*>/g).forEach(function (e) {
            var name = /(name|property)="([^"]*)"/.exec(e)
            var value = /content="([^"]*)"/.exec(e)
            if (name && value) { obj[name[2]] = $.trim(value[1]) }
          })

          d.notify(100).resolve(obj)
        },
        error: function (xhr, status) { d.reject(status) }
      })
    }).done(cb).promise()
  }

  // export object
  return data
}))
