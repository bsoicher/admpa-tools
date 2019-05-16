/**
 * Handles loading and managing of an AEM node
 */

/* global $ */

/**
 * AEM node object
 * @param {String} url location
 * @param {AEM_Node} alt Connect with alt node
 * @constructor
 */
function AEM_Node (url, alt) {
  // Validate URL
  if (!/^https:\/\/www\.canada\.ca\/(en|fr)\/[^.]+\.html$/i.test(url)) {
    throw new Error('Invalid node URL')
  }

  this.url = url

  // Extract language from URL
  this.language = /canada.ca\/fr\//i.test(url) ? 'fr' : 'en'

  // Interlink node and alternate node
  if (alt instanceof AEM_Node) {
    this.alt = alt
  }

  var i = this

  $.ajax({

    // URL of JSON node data
    url: this.url.replace('.html', '/_jcr_content.json'),

    // Process json response
    success: function (json) {
      // Basic node information
      i.title = json['jcr:title'] || null
      i.desc = json['gcDescription'] || null
      i.keywords = json['gcKeywords'] || null
      i.thumb = json['gcOGImage'] || null

      // Convert date strings to objects
      i.created = new Date(json['jcr:created'])
      i.modified = json['jcr:lastModified'] ? new Date(json['jcr:lastModified']) : null
      i.published = new Date(json['gcLastPublished'])
      i.expires = new Date(json['gcDateExpired'])

      // Create and link alternate node if it has not been created
      if (!i.alt && json['gcAltLanguagePeer']) {
        i.alt = new AEM_Node(json['gcAltLanguagePeer'].replace('/content/canadasite/', 'https://www.canada.ca/'), i)
      }
    },

    // Log if AJAX error occured
    error: function (jqXHR, textStatus, ex) {
      console.log(textStatus + ',' + ex + ',' + jqXHR.responseText)
    }
  })

}



AEM_Node.prototype.children = function () {



}


var test = new AEM_Node('https://www.canada.ca/fr/ministere-defense-nationale/test/feuille-derable/ops/2019/05/07-roumaine.html')

console.log(test);

setTimeout(function(){
  console.log(test) 
},200)