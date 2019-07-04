/**
 * Canada.ca AEM web api tools
 *
 * @author Ben Soicher
 * @version 0.0.3
 */

/* global define, self */

(function (root, factory) {
  // Universal module loader

  if (typeof exports === 'object') {
    // CommonJS
    factory(exports, require('async'), require('jquery'))
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define(['exports', 'async', 'jquery'], factory)
  } else {
    // Browser
    factory((root.AEM = {}), root.async, root.jQuery)
  }
}(typeof self !== 'undefined' ? self : this, function (exports, async, jQuery) {

  /**
   * AEM domain name
   * @var {String}
   */
  var domain = 'https://www.canada.ca/'

  /**
   * Node URL extensions
   * @var {Object}
   */
  var ext = {
    meta: '/_jcr_content.json',
    map: '.sitemap.xml',
    doc: '.html'
  }

  /**
   * Async AJAX function
   * @param {String} path Node path
   * @param {Function} cb Callback
   */
  function get (path, cb) {
    jQuery.get({ url: domain + path, cache: false }).done(cb)
  }

  /**
   * Create an AJAX task
   * @param {String} url Node URL
   * @returns {String}
   */
  function task (path, cb) {
    return function (cb) {
      get(path, cb)
    }
  }

  /**
   * Async queue for ajax calls. Limits concurrent requests
   * @var {QueueObject}
   */
  var queue = async.queue(get, 6)

  /**
   * Turn a URL into a node path
   * @param {String} url Node URL
   * @returns {String}
   */
  function normalize (url) {
    return url.replace(domain, '').replace(/^(\/content\/canadasite\/|\/)/, '').replace(/(\.[^/.]+|\/)$/, '')
  }

  /**
   * Get node metadata
   * @param {String} path Node path
   * @param {Function} cb Callback
   * @returns {Promise}
   */
  exports.meta = function (path, cb) {
    return queue.push(path + ext.meta, cb)
  }

  /**
   * Get list of child nodes
   * @param {String} path Node path
   * @param {Function} cb Callback
   */
  exports.children = function (path, cb) {
    this.meta(path, function (meta) {
      async.parallel([
        task(path + ext.map),
        task(normalize(meta['gcAltLanguagePeer']) + ext.map)
      ], function (xml) {
        cb(jQuery(xml).find('loc').map(function () {
          return normalize(this.innerHTML)
        }).get())
      })
    })
  }

  /**
   * Add callback when queue finishes
   * @param {Function} cb Callback
   */
  exports.done = function (cb) {
    queue.drain(cb)
  }

  // End of module
}))
