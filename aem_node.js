/**
 * Handles loading and managing of an AEM node
 */

/* global $ */


/**
 * AEM node object
 * @param {String} url location
 * @param {AEM_Node} peer previously loaded peer
 * @constructor
 */
function AEM_Node (url, peer) {

  // Validate URL
  if (!/^https:\/\/www\.canada\.ca\/(en|fr)\/[^\.]+\.html$/i.test(url)) {
    throw new Error('Invalid node URL')
  }

  // Extract language from URL
  this.language = /canada.ca\/fr\//i.test(url) ? 'fr' : 'en'

  this.url = url
  this.loaded = false

  // Interlink peers
  if (peer instanceof AEM_Node) {
    this._peer = peer
  }

  this.load()
}

AEM_Node.prototype.load = function () {
  var i = this

  $.ajax({
    url: this.url.replace('.html', '/_jcr_content.json'),
    success: function (json) {
      i._data = json
      i.loaded = true

      // If peer has not been created yet
      if (!i._peer && json.gcAltLanguagePeer) {
        i._peer = new AEM_Node(json.gcAltLanguagePeer.replace('/content/canadasite/', 'https://www.canada.ca/'), i)
      }
    }
  })
}

var keymap = {
  'jcr:title': 'title',
  'gcDescription': 'description',
  'gcKeywords': 'keywords',
  'gcOGImage': 'thumbnail',
  'jcr:created': 'created',
  'jcr:lastModified': 'modified',
  'gcLastPublished': 'published',
  'gcDateExpired': 'expired',
}

AEM_Node.prototype.json = function () {

  var obj = {}

  if (this.loaded) {
    for (var key in keymap) {
      obj[keymap[key] + '-' + this.language] = this._data[key]
    }
  }

  if (this._peer && this._peer.loaded) {
    for (var key in keymap) {
      obj[keymap[key] + '-' + this._peer.language] = this._peer._data[key]
    }
  }

  return obj
}
