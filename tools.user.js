// ==UserScript==
// @name         AEM Tools
// @namespace    https://caf-fac.ca/
// @version      0.1.0
// @updateURL    https://caf-fac.ca/tools/tools.user.js
// @description  Tools to help with AEM publishing to canada.ca
// @author       Ben Soicher
// @include      http://52.204.44.53/*
// @include      https://www.canada.ca/*
// @include      https://author-canada-prod.adobecqms.net/*
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-end
// ==/UserScript==

(function ($) {

  var server = 'http://52.204.44.53'
  var url = window.location
  var alt = GM_getValue('alt', false)
  var autoPublish = '&autopublish'

  // Check for auto close flag
  if (document.referrer.includes('&autoclose')) { return window.close() }

  // Check for auto publish flag
  if (url.pathname.endsWith('/publishpagewizard.html') && url.href.includes('&autopublish')) {
    $('form.cq-siteadmin-admin-publishpage-form').submit()
  }

  if (window.location.href.includes('canada.ca')) {
    var node = window.location.href.replace('https://www.canada.ca/', '/content/canadasite/').replace('.html', '')
    var node_alt = '/content/canadasite' + $('#wb-lng a').attr('href').replace('.html', '')

    var menu = '<ul id="aem_tools" class=" pull-right mrgn-tp-md" role="toolbar">'
    menu += '<li class="btn-group mrgn-rght-sm"><button class="btn ' + (alt ? 'btn-danger' : 'btn-default') + ' brdr-rds-0" data-action="both" id="both" title="Toggle between selecting both language nodes or only the current node">' + (alt ? 'Both' : 'Single') + '</button></li>'
    menu += '<li class="btn-group">'
    menu += '<button class="btn btn-default brdr-rds-0" data-action="metadata" title="View metadata JSON">Metadata</button>'
    menu += '<button class="btn btn-default brdr-rds-0" data-action="qa" title="Run Maple Leaf QA tool">QA</button>'
    menu += '<button class="btn btn-info brdr-rds-0" data-action="folder" title="Open AEM folder view">Folder</button>'
    menu += '<button class="btn btn-info brdr-rds-0" data-action="editor" title="Open AEM page editor">Editor</button>'
    menu += '<button class="btn btn-info brdr-rds-0" data-action="properties" title="Open AEM properties editor">Properties</button>'
    menu += '<button class="btn btn-danger brdr-rds-0" data-action="publish" title="Republish to production">Republish</button>'
    menu += '</li>'
    menu += '</ul>'

    $(menu).appendTo('.gcweb-menu .container:first')
  }

  // Available actions
  var actions = {
    both: function () {
      alt = !alt
      $('#both').text(alt ? 'Both' : 'Single').removeClass(alt ? 'btn-default' : 'btn-danger').addClass(alt ? 'btn-danger' : 'btn-default')
      GM_setValue('alt', alt)
    },
    editor: function () {
      if (alt) { window.open(server + '/editor.html' + node_alt + '.html') }
      window.open(server + '/editor.html' + node + '.html')
    },
    properties: function () {
      if (alt) { window.open(server + '/mnt/overlay/wcm/core/content/sites/properties.html?item=' + node_alt + '&autoclose') }
      window.open(server + '/mnt/overlay/wcm/core/content/sites/properties.html?item=' + node + '&autoclose')
    },
    metadata: function () {
      var t = new Date().getTime()
      if (alt) { window.open(node_alt + '/_jcr_content.json?_=' + t) }
      window.open(node + '/_jcr_content.json?_=' + t)
    },
    publish: function () {
      if (alt) { window.open(server + '/libs/wcm/core/content/sites/publishpagewizard.html?item=' + node_alt + '&autoclose' + autoPublish) }
      window.open(server + '/libs/wcm/core/content/sites/publishpagewizard.html?item=' + node + '&autoclose' + autoPublish)
    },
    folder: function () {
      if (alt) { window.open(server + '/sites.html' + node_alt.replace(/[^/]+$/i, '')) }
      window.open(server + '/sites.html' + node.replace(/[^/]+$/i, ''))
    },
    qa: function () {
      if (alt) { window.open('https://caf-fac.ca/tools/ml/qa-single.html?=' + node_alt.replace('/content/canadasite/', 'https://www.canada.ca/') + '.html') }
      window.open('https://caf-fac.ca/tools/ml/qa-single.html?=' + node.replace('/content/canadasite/', 'https://www.canada.ca/') + '.html')
    }
  }

  // Handle button events
  $(document).on('click', '#aem_tools button', function (e) {
    var name = $(this).data('action')
    if (name && typeof actions[name] === 'function') { actions[name]() }
  })

})(jQuery)