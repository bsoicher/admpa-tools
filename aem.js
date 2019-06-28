
/* global define, self */

(function (root, factory) {
  // Universal module loader

  if (typeof define === 'function' && define.amd) {
    // AMD
    define(['exports', 'async', 'jquery'], factory)
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS
    factory(exports, require('async'), require('jquery'))
  } else {
    // Browser
    factory((root.aem = {}), root.async, root.jQuery)
  }

}(typeof self !== 'undefined' ? self : this, function (exports, async, jQuery) {

  /**
   * AEM domain name
   * @var {String}
   */
  exports.domain = 'https://www.canada.ca/'

  /**
   * Node URL extensions
   * @var {Object}
   */
  exports.ext = {
    meta: '/_jcr_content.json',
    map: '.sitemap.xml',
    doc: '.html'
  }

  /**
   * Async queue for ajax calls. Limits concurrent requests
   * @var {QueueObject}
   */
  var queue = async.queue(function (path, cb) {
    jQuery.get({ url: domain + path, cache: false }).done(cb)
  }, 5)

  /**
   * Turn a URL into a node path
   * @param {String} url Node URL
   * @returns {String}
   */
  function normalize (url) {
    return url.replace(domain, '').replace(/^(\/content\/canadasite\/|\/)/, '').replace(/(\.[^/.]+|\/)$/, '')
  }


  exports. 
  return {



    

    /**
     * Get node metadata
     * @param {String} path Node path
     * @param {Function} cb Callback
     */
    meta: function (path, cb) {
      return queue.push(path + this.ext.meta, cb)
    },

    /**
     * Get list of child nodes
     * @param {String} path Node path
     * @param {Function} cb Callback
     */
    children: function (path, cb) {
      this.meta(path, function (meta) {
        async.parallel([
          ajaxTask(path + AEM.ext.map),
          ajaxTask(normalize(meta['gcAltLanguagePeer']) + AEM.ext.map)
        ], function (xml) {
          console.log(xml)
          cb(jQuery(xml).find('loc').map(function () {
            return normalize(this.innerHTML)
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

  // End of module
}))
