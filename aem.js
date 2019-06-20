
/* global async, jQuery */

/**
 * AEM functions
 * @var {Object}
 */
var AEM = {

  /**
   * AEM domain name
   * @var {String}
   */
  domain: 'https://www.canada.ca/',

  /**
   * Node URL extensions
   * @var {Object}
   */
  ext: {
    meta: '/_jcr_content.json',
    map: '.sitemap.xml',
    doc: '.html'
  },

  /**
   * Async queue for ajax calls, caches requests
   * @var {QueueObject}
   */
  _queue: async.queue(function (url, cb) {
    jQuery.get({ url: url, cache: false }).done(cb)
  }, 5),

  /**
   * Turn a URL into a node path
   * @param {String} url Node URL
   * @returns {String}
   */
  normalize: function (url) {
    return url.replace(this.domain, '').replace(/^(\/content\/canadasite\/|\/)/, '').replace(/(\.[^/.]+|\/)$/, '')
  },

  /**
   * Get node metadata
   * @param {String} path Node path
   * @param {Function} cb Callback
   */
  meta: function (path, cb) {
    return this._queue.push(this.domain + path + this.ext.meta, cb)
  },

  /**
   * Get list of child nodes
   * @param {String} path Node path
   * @param {Function} cb Callback
   */
  children: function (path, cb) {
    this.meta(path, function (meta) {
      async.parallel([
        function (cb) {
          jQuery.get({ url: AEM.domain + path + AEM.ext.map, cache: false }).done(cb)
        },
        function (cb) {
          jQuery.get({ url: AEM.domain + AEM.normalize(meta['gcAltLanguagePeer']) + AEM.ext.map, cache: false }).done(cb)
        }
      ], function (xml) {
        cb(jQuery(xml).find('loc:not(:first)').map(function () {
          return AEM.normalize(this.innerHTML)
        }).get())
      })
    })
  },

  /**
   * Add callback when queue finishes
   * @param {Function} cb Callback
   */
  done: function (cb) {
    this._queue.drain(cb)
  }
}
