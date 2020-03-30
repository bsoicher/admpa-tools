
/**
 * Loader of data that will be QA'd
 */
(function (root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory(require('mocha'), require('chai'), require('jquery'))
  } else {
    root.data = factory(root.Mocha, root.chai.assert, root.jQuery)
  }
}(this, function (Mocha, assert, $) {

  // Will be populated
  var data = {
    meta: null,
    doc: null,
    wp: null
  }

  // Prevent loading cached data
  $.ajaxSetup({ cache: false })

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
    loadJCR(url).fail(function (e) {
      $('<div class="alert alert-danger">AJAX Error: Failed to load with response \'' + e + '\'</div>').appendTo('#mocha')
    }).done(function (meta) {
      data.url = url

      // Load WordPress export, HTML document, and alt language meta
      $.when(
        loadWP(url),
        loadDoc(url),
        loadJCR(meta['gcAltLanguagePeer'])
      ).done(function (wp, doc, alt) {
        meta.alt = alt

        data.meta = meta
        data.doc = doc
        data.wp = wp

        console.log(data)
        window.run()
      })
    })

  })

  /**
   * Get metadata of an AEM node
   */
  function loadJCR(url) {
    var d = $.Deferred()

    $.get({
      url: url.replace('/content/canadasite/', 'https://www.canada.ca/').replace('.html', '/_jcr_content.json'),
      success: function (jcr) { d.resolve(jcr) },
      error: function (xhr, status, err) { d.reject(err) }
    })

    return d.promise()
  }

  /**
   * Get HTML document of AEM page
   */
  function loadDoc(url) {
    var d = $.Deferred()

    $.get({
      url: url.replace('/content/canadasite/', 'https://www.canada.ca/'),
      dataFilter: function (data) { return data.replace(/src="/ig, ' src="https://www.canada.ca/') },
      success: function (html) { d.resolve($(html)) },
      error: function () { d.resolve(null) }
    })

    return d.promise()
  }

  /**
   * Get WordPress version of AEM page if it exists
   */
  function loadWP(url) {
    var d = $.Deferred()

    $.get({
      url: 'https://ml-fd.caf-fac.ca/wp-content/themes/canada/old_article.php?url=' + url,
      success: function (jcr) { d.resolve(jcr) },
      error: function () { d.resolve(null) }
    })

    return d.promise()
  }

  // export object
  return data
}))
