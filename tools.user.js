// ==UserScript==
// @name         AEM Tools
// @namespace    http://www.bensoicher.ca
// @version      0.1
// @updateURL    https://caf-fac.ca/tools/tools.user.js
// @description  Toolbar of AEM shortcuts
// @author       Ben Soicher
// @include      https://www.canada.ca/*
// @include      https://author-canada-prod.adobecqms.net/*
// @require      http://code.jquery.com/jquery-3.4.1.min.js
// @run-at       document-end
// ==/UserScript==

(function ($) {
  'use strict'

  if (window.location.href.includes('canada.ca')) {

    var node = window.location.href.replace('https://www.canada.ca/', '/content/canadasite/').replace('.html', '')
    var node_alt = '/content/canadasite' + $('#wb-lng a').attr('href').replace('.html', '')

    var author = 'https://author-canada-prod.adobecqms.net'

    var menu = '<ul id="aem_tools" class="btn-toolbar list-inline pull-right mrgn-tp-sm" role="toolbar">'
    menu += '<li class="btn btn-link">View</li>'
    menu += '<li class="btn-group">'
    menu += '<a class="btn btn-default" data-type="meta" target="_blank">Metadata</a>'
    menu += '<a class="btn btn-default" data-type="folder" target="_blank">Folder</a>'
    menu += '<a class="btn btn-default" data-type="qa" target="_blank">QA</a>'
    menu += '</li>'
    menu += '<li class="btn btn-link">Edit</li>'
    menu += '<li class="btn-group">'
    menu += '<a class="btn btn-default" data-type="edit" target="_blank">Content</a>'
    menu += '<a class="btn btn-default" data-type="prop" target="_blank">Properties</a>'
    menu += '</li>'
    menu += '<li class="btn btn-link">Publish</li>'
    menu += '<li class="btn-group">'
    menu += '<a class="btn btn-default" data-type="publish" target="_blank">Production</a>'
    menu += '</li>'
    menu += '</ul>'

    $(menu).appendTo('.gcweb-menu .container:first')

  }

  function link(type, node) {

    switch (type) {
      case 'edit': return author + '/editor.html' + node + '.html'
      case 'prop': return author + '/mnt/overlay/wcm/core/content/sites/properties.html?item=' + node
      case 'meta': return node + '/_jcr_content.json?_=' + new Date().getTime()
      case 'publish': return author + '/libs/wcm/core/content/sites/publishpagewizard.html?item=' + node
      case 'qa': return 'https://caf-fac.ca/tools/ml/qa-single.html?=' + window.location.href
      case 'folder': return author + '/sites.html' + node.replace(/[^/]+$/i, '')
    }
  }


  $(document).on('click', '#aem_tools a', function (e) {
    var i = $(this)
    var type = i.data('type') || ''
    var target = i.attr('target') || '_self'

    window.open(link(type, node), target)

    /*if(type !== 'qa' || type!=='edit'){
        window.open(link(type, node_alt), target)
        window.open(link(type, node), target)
    } else {
        window.open(link(type, node), target)
    }*/

  })

  function status(cb) {
    var d = $.Deferred()
    $.ajax(author, { complete: function (xhr) { d.resolve(xhr.status) } })
    if (cb) { d.then(cb) }
    return d
  }

  status(function (code) {
    console.log(code)
  })

})(jQuery)