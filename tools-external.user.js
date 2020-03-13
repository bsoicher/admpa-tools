// ==UserScript==
// @name         AEM Tools
// @namespace    https://caf-fac.ca/
// @version      0.1.0
// @updateURL    https://caf-fac.ca/tools/tools.user.js
// @description  Tools to help with AEM publishing to canada.ca
// @author       Ben Soicher
// @include      https://www.canada.ca/*
// @include      https://author-canada-prod.adobecqms.net/*
// @include      http://*/sites.html/content/*
// @include      http://*/assets.html/content/*
// @include      http://*/mnt/overlay/wcm/core/content/sites/properties.html*
// @include      http://*/libs/wcm/core/content/sites/publishpagewizard.html*
// @require      http://code.jquery.com/jquery-3.4.1.min.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @grant        window.close
// @grant        window.focus
// @run-at       document-end
// ==/UserScript==

(function ($) {

    GM_xmlhttpRequest({
      url: 'https://caf-fac.ca/tools/a.txt',
      onload: function (server) {
  
        server = 'http://' + server
        console.log('Server: ' + server)
  
        var url = window.location
        var autoPublish = '&autopublish'
  
        // Check for auto close flag
        if (document.referrer.includes('&autoclose')) { return window.close() }
  
        // Check for auto publish flag
        if (url.pathname.endsWith('/publishpagewizard.html') && url.href.includes('&autopublish')) {
          $('form.cq-siteadmin-admin-publishpage-form').submit()
        }
  
        if (window.location.href.includes('https://www.canada.ca')) {
          var node = window.location.href.replace('https://www.canada.ca/', '/content/canadasite/').replace('.html', '')
          var menu = '<ul id="aem_tools" class=" pull-right mrgn-tp-md" role="toolbar">'
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
          editor: function () {
            window.open(server + '/editor.html' + node + '.html')
          },
          properties: function () {
            window.open(server + '/mnt/overlay/wcm/core/content/sites/properties.html?item=' + node + '&autoclose')
          },
          metadata: function () {
            var t = new Date().getTime()
            window.open(node + '/_jcr_content.json?_=' + t)
          },
          publish: function () {
            window.open(server + '/libs/wcm/core/content/sites/publishpagewizard.html?item=' + node + '&autoclose' + autoPublish, '_blank')
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
          if (name && typeof actions[name] === 'function') { actions[name]() }
        })
      }
  
    })
  
  })(jQuery)