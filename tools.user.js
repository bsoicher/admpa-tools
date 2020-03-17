// ==UserScript==
// @name         AEM Tools
// @namespace    https://caf-fac.ca/
// @version      0.1.0
// @updateURL    https://caf-fac.ca/tools/tools.user.js
// @description  Tools to help with AEM publishing to canada.ca
// @author       Ben Soicher
// @include      http://54.174.44.50/*
// @include      https://www.canada.ca/*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @run-at       document-end
// ==/UserScript==

(function ($) {
  var server = GM_info.script.includes[0].slice(0, -2)
  var url = window.location
  var autoPublish = '' //'&autopublish'

  // Check for auto close flag
  if (document.referrer.includes('&autoclose')) { return window.close() }

  // Check for auto publish flag
  if (url.pathname.endsWith('/publishpagewizard.html') && url.href.includes('&autopublish')) {
    $('form.cq-siteadmin-admin-publishpage-form').submit()
  }

  if (window.location.href.includes('canada.ca')) {
    var node = window.location.href.replace('https://www.canada.ca/', '/content/canadasite/').replace('.html', '')

    var menu = '<ul id="aem_tools" class=" pull-right mrgn-tp-md" role="toolbar">'
    menu += '<li class="btn-group">'
    menu += '<button class="btn btn-default brdr-rds-0" data-action="meta" title="View metadata JSON">Metadata</button>'
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
    editor: function () {
      window.open(server + '/editor.html' + node + '.html')
    },
    properties: function () {
      window.open(server + '/mnt/overlay/wcm/core/content/sites/properties.html?item=' + node + '&autoclose')
    },
    meta: function () {
      window.open('https://www.canada.ca' + node + '/_jcr_content.json?_=' + new Date().getTime())
    },
    publish: function () {
      window.open(server + '/libs/wcm/core/content/sites/publishpagewizard.html?item=' + node + '&autoclose' + autoPublish, '_blank', 'width=500,height=100')
    },
    folder: function () {
      window.open(server + '/sites.html' + node.replace(/[^/]+$/i, ''))
    },
    qa: function () {
      window.open('https://caf-fac.ca/tools/ml/qa-single.html?=' + node.replace('/content/canadasite/', 'https://www.canada.ca/') + '.html')
    }
  }

  // Handle button events
  $(document).on('click', '#aem_tools button', function (e) {
    var name = $(this).data('action')
    actions[name]()
  })

})(jQuery)