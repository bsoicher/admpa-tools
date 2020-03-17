
/* global define */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['mocha', 'jquery'], factory)
  } else if (typeof exports === 'object') {
    module.exports = factory(require('mocha'), require('jquery'))
  } else {
    root.QA = factory(root.Mocha, root.jQuery)
  }
}(this, function (Mocha, $) {

  var Base = Mocha.reporters.Base
  var utils = Mocha.utils
  var escape = utils.escape

  var constants = Mocha.Runner.constants

  var $mocha = $('#mocha')

  /**
   * Stats template.
   */
  var statsTemplate =
    '<ul id="mocha-stats">' +

    '<li class="passes"><a href="javascript:void(0);" class="passes">passes:</a> <em>0</em></li>' +
    '<li class="failures"><a href="javascript:void(0);" class="failures">failures:</a> <em>0</em></li>' +
    '<li class="duration">duration: <em>0</em>s</li>' +
    '</ul>'

  function QA (runner, options) {
    Base.call(this, runner, options)

    var self = this
    var stats = this.stats
    //var stat = fragment(statsTemplate)
    //var items = stat.getElementsByTagName('li')
    //var passes = items[1].getElementsByTagName('em')[0]

    var $passes = $('#passes')
    var $failures = $('#failures')
    var $duration = $('#duration')
    var $progress = $('#progress')

    //var passesLink = items[1].getElementsByTagName('a')[0]
    //var failures = items[2].getElementsByTagName('em')[0]
    //var failuresLink = items[2].getElementsByTagName('a')[0]

    //var progress = items[0].getElementsByClassName('progress-bar')[0]

    

    //var stack = [report]

    var ctx

    var root = $('#mocha')
    var report = $('<div id="mocha-report"></div>').appendTo(root)

    if (!root) {
      return console.error('#mocha div missing, add it to your document')
    }

    $(document).on('click', 'a.passes', function (e) {
      console.log('only show passes')
    })

    $(document).on('click', 'a.failures', function (e) {
      $('.suite:has(.fail), .fail').removeClass('d-none')
      $('.suite:not(:has(.fail)').addClass('d-none')
    })

    runner.on(constants.EVENT_SUITE_BEGIN, function (suite) {
      if (!suite.root) {
        suite.root = $('<h2 class="h4">' + suite.title + '</h2>').appendTo(report)
      }
    })

    runner.on(constants.EVENT_SUITE_END, function (suite) {
      if (suite.root) {
        updateStats()
      }
    })

    runner.on(constants.EVENT_TEST_PASS, function (test) {

      // var suite = test.parent

      report.append('<p class="test pass ' + test.speed + '">&#x2714;' + test.title + '<span class="duration">' + test.duration + '</span></p>')

      // self.addCodeToggle(el, test.body);

      updateStats()
    })

    runner.on(constants.EVENT_TEST_FAIL, function (test) {

      var message = test.err.toString()

      if (message === '[object Error]') {
        message = test.err.message
      }

      report.append('<p class="test fail">&#10060; ' + test.title + ' --- ' + message + '</p>')

      /*

      if (test.err.stack) {
        var indexOfMessage = test.err.stack.indexOf(test.err.message);
        if (indexOfMessage === -1) {
          stackString = test.err.stack;
        } else {
          stackString = test.err.stack.substr(
            test.err.message.length + indexOfMessage
          );
        }
      } else if (test.err.sourceURL && test.err.line !== undefined) {
        // Safari doesn't give you a stack. Let's at least provide a source line.
        stackString = '\n(' + test.err.sourceURL + ':' + test.err.line + ')';
      }

      stackString = stackString || '';

      if (test.err.htmlMessage && stackString) {
        el.appendChild(
          fragment(
            '<div class="html-error">%s\n<pre class="error">%e</pre></div>',
            test.err.htmlMessage,
            stackString
          )
        );
      } else if (test.err.htmlMessage) {
        el.appendChild(
          fragment('<div class="html-error">%s</div>', test.err.htmlMessage)
        );
      } else {
        el.appendChild(
          fragment('<pre class="error">%e%e</pre>', message, stackString)
        );
      }

      self.addCodeToggle(el, test.body);
      appendToStack(el);
      */

      updateStats()
    })

    runner.on(constants.EVENT_TEST_PENDING, function (test) {
      $('<p class="test pending"><span class="text-warning" title="Skipped">&#10033;</span> ' + test.title + '</p>').appendTo(report)
      updateStats()
    })

    function updateStats () {

      var str = '<ul class="list-inline">'
      str += '<li class="list-inline-item">Total: <span class="font-weight-bold">' + runner.total + '</span></li>'

      str += '<li class="list-inline-item">Passed: <span class="text-success font-weight-bold">' + stats.passes + '</span></li>'

      if (stats.pending) {
        str += '<li class="list-inline-item">Skipped: <span class="text-warning font-weight-bold">' + stats.pending + '</span></li>'
      }


      str += '<li class="list-inline-item">Failed: <span class="text-danger font-weight-bold">' + stats.failures + '</span></li>'

     
      str += '<li class="list-inline-item">Runtime: <span class="font-weight-bold">' + ((new Date() - stats.start) / 1000).toFixed(2) + 's</span></li>'
      str += '</ul>'

      $('#mocha-stats').html(str)

      $('#progress_passes').width(((stats.passes / runner.total) * 100 | 0) + '%')
      $('#progress_failures').width(((stats.failures / runner.total) * 100 | 0) + '%')
      $('#progress_pending').width(((stats.pending / runner.total) * 100 | 0) + '%')
    }
  }

  /**
   * Makes a URL, preserving querystring ("search") parameters.
   *
   * @param {string} s
   * @return {string} A new URL.
   */
  function makeUrl (s) {
    var search = window.location.search;

    // Remove previous grep query parameter if present
    if (search) {
      search = search.replace(/[?&]grep=[^&\s]*/g, '').replace(/^&/, '?');
    }

    return (
      window.location.pathname +
      (search ? search + '&' : '?') +
      'grep=' +
      encodeURIComponent(s)
    )
  }

  /**
   * Provide suite URL.
   *
   * @param {Object} [suite]
   */
  QA.prototype.suiteURL = function (suite) {
    return makeUrl(suite.fullTitle())
  }

  /**
   * Provide test URL.
   *
   * @param {Object} [test]
   */
  QA.prototype.testURL = function (test) {
    return makeUrl(test.fullTitle())
  }

  /**
   * Adds code toggle functionality for the provided test's list element.
   *
   * @param {HTMLLIElement} el
   * @param {string} contents
   */
  QA.prototype.addCodeToggle = function (el, contents) {
    var h2 = el.getElementsByTagName('h2')[0]
    var pre = fragment('<pre><code>%e</code></pre>', utils.clean(contents))
    el.appendChild(pre)
    pre.style.display = 'none'
  }

  /**
   * Return a DOM fragment from `html`.
   *
   * @param {string} html
   */
  function fragment (html) {
    var args = arguments
    var div = document.createElement('div')
    var i = 1

    div.innerHTML = html.replace(/%([se])/g, function (_, type) {
      switch (type) {
        case 's':
          return String(args[i++])
        case 'e':
          return escape(args[i++])
        // no default
      }
    })

    return div.firstChild
  }

  // Flag as browser only
  QA.browserOnly = true

  // export reporter
  return QA
}))
