

/* global async, download, EventEmitter, jQuery, utf8 */

// Prevent browser caching


var root = 'en/department-national-defence/test/maple-leaf'


AEM_Node.prototype = {

  

}

// Instance of EventEmitter
var AEM = new EventEmitter()

/**
 * AEM domain name
 * @var {String}
 */
AEM.domain = 'https://www.canada.ca/'

/**
 * Preload nodes
 * @param {String} node Node path
 * @param {String} match Load children matching pattern
 */
AEM.preload = function (node, match) {

  jQuery.get(this.domain + node + '/_jcr_content.json').done(function (jcr) {

  })

}



/**
 * Check if a node is already loaded
 * @returns {Boolean}
 */
AEM.isCached = function (node) {
  return node in this.cache
}

AEM.on('progress', function(){
  console.log(123)
})

AEM.test()

