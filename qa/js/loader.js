
/**
 * Loader of data that will be QA'd
 */
(function (root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory(require('jquery'))
  } else {
    root.Loader = factory(root.jQuery)
  }
}(this, function ($) {

  /**
     * Get metadata of an AEM node
     * @param {String} url AEM document URL
     * @return {Promise.<Object, null>} WordPress article object
     */
  function load_jcr(url) {
    var d = $.Deferred()

    $.get({
      url: url.replace('/content/canadasite/', 'https://www.canada.ca/').replace('.html', '/_jcr_content.json'),
      success: function (jcr) { d.resolve(jcr) },
      error: function (xhr, status, err) { d.reject(err) }
    })

    return d.promise()
  }

  /**
   * Get WordPress version of AEM page if it exists
   * @param {String} url AEM document URL
   * @return {Promise.<Object, null>} WordPress article object
   */
  function load_wp(url) {
    var d = $.Deferred()

    $.get({
      url: 'https://ml-fd.caf-fac.ca/wp-content/themes/canada/old_article.php?url=' + url,
      success: function (jcr) { d.resolve(jcr) },
      error: function () { d.resolve(null) }
    })

    return d.promise()
  }

  /**
   * Get HTML document of AEM page
   * @param {String} url AEM document URL
   * @return {Promise.<jQuery, null>} jQuery processed AEM article document 
   */
  function load_page(url) {
    var d = $.Deferred()

    $.get({
      url: url.replace('/content/canadasite/', 'https://www.canada.ca/'),
      dataFilter: function (data) { return data.replace(/src="/ig, ' src="https://www.canada.ca/') },
      success: function (html) { d.resolve($('<div>' + html + '</div>')) },
      error: function () { d.resolve(null) }
    })

    return d.promise()
  }

  /**
   * Download all the relevant data in parallel
   * @param {String} url AEM document URL
   * @return {Promise.<Object>} contains all the data sources
   */
  function load(url) {
    var d = $.Deferred()

    load_jcr(url).done(function (jcr) {
      $.when(
        load_wp(url),
        load_jcr(jcr.gcAltLanguagePeer),
        load_page(url)
      ).done(function (wp, jcr_alt, $doc) {
        d.resolve({ jcr: jcr, $doc: $doc, jcr_alt: jcr_alt, wp: wp })
      })
    }).fail(function (e) {
      throw new Error('Unable to load')

    })

    return d.promise()
  }

})