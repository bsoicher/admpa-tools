
/**
 * Custom Mocha reporter
 * @see https://mochajs.org/api/tutorial-custom-reporter.html
 */
(function (root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory(require('mocha'), require('jquery'))
  } else {
    root.Reporter = factory(root.Mocha, root.jQuery)
  }
}(this, function (Mocha, $) {
  var utils = Mocha.utils
  var constants = Mocha.Runner.constants

  /**
   * Construct a new reporter instance
   * @extends Mocha.reporters.Base
   * @param {Runner} runner - Instance triggers reporter actions.
   * @param {Object} [options] - runner options
   */
  function Reporter(runner, options) {
    var self = this
    var stats = this.stats

    // Call the Base mocha reporter
    Mocha.reporters.Base.call(this, runner, options)

    var root = $('#mocha')
    var report = $('<div id="mocha-report"></div>').appendTo(root)

    if (!root) {
      return console.error('#mocha div missing, add it to your document')
    }

    $(document).on('click', '#view-passes', function () {
      $('.fail,.pending').hide()
      $('.pass').show()
    })

    $(document).on('click', '#view-failures', function () {
      $('.fail').show()
      $('.pass,.pending').hide()
    })

    $(document).on('click', '#view-pending', function () {
      $('.pending').show()
      $('.pass,.fail').hide()
    })

    $(document).on('click', '#view-all', function () {
      $('.test,.suite').show()
    })






    runner.on(constants.EVENT_SUITE_BEGIN, function (suite) {
      self.increaseIndent()

      if (!suite.root) {
        suite.root = $('<h2 class="suite h5">' + suite.title + '</h2>').appendTo(report)
      }
    })

    runner.on(constants.EVENT_SUITE_END, function (suite) {
      self.decreaseIndent()

      if (suite.root) {
        updateStats()
      }
    })

    runner.on(constants.EVENT_TEST_PASS, function (test) {
      // var suite = test.parent

      report.append('<p class="test pass ' + test.speed + '">' + this.indent() + '<strong class="text-success">✓</strong> ' + test.title + '<span class="duration">' + test.duration + '</span></p>')

      // self.addCodeToggle(el, test.body);

      updateStats()
    })

    runner.on(constants.EVENT_TEST_FAIL, function (test) {
      var message = test.err.toString()

      if (message === '[object Error]') {
        message = test.err.message
      }

      report.append('<p class="test fail">' + this.indent() + '<strong class="text-danger">✕</strong> ' + test.title + ' --- ' + message + '</p>')

      updateStats()
    })

    runner.on(constants.EVENT_TEST_PENDING, function (test) {
      $('<p class="test pending"><span class="text-warning" title="Skipped">&#10033;</span> ' + test.title + '</p>').appendTo(report)
      updateStats()
    })

    function updateStats() {
      $('#stat-total').text(runner.total)
      $('#stat-passes').text(stats.passes)
      $('#stat-pending').text(stats.pending)
      $('#stat-failures').text(stats.failures)
      $('#stat-time').text(((new Date() - stats.start) / 1000).toFixed(2) + 's')
      $('#progress-passes').width(((stats.passes / runner.total) * 100 | 0) + '%')
      $('#progress-pending').width(((stats.pending / runner.total) * 100 | 0) + '%')
      $('#progress-failures').width(((stats.failures / runner.total) * 100 | 0) + '%')
    }
  }

  /**
   * Makes a URL, preserving querystring ("search") parameters.
   *
   * @param {string} s
   * @return {string} A new URL.
   */
  function makeUrl(s) {
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


  Reporter.prototype._indents = 0

  Reporter.prototype.indent = function () {
    return Array(this._indents).join('&nbsp;&nbsp;')
  }

  Reporter.prototype.increaseIndent = function () {
    this._indents++
  }

  Reporter.prototype.decreaseIndent = function () {
    this._indents--
  }

  /**
   * Provide suite URL.
   *
   * @param {Object} [suite]
   */
  Reporter.prototype.suiteURL = function (suite) {
    return makeUrl(suite.fullTitle())
  }

  /**
   * Provide test URL.
   *
   * @param {Object} [test]
   */
  Reporter.prototype.testURL = function (test) {
    return makeUrl(test.fullTitle())
  }

  /**
   * Adds code toggle functionality for the provided test's list element.
   *
   * @param {HTMLLIElement} el
   * @param {string} contents
   */
  Reporter.prototype.addCodeToggle = function (el, contents) {
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
  function fragment(html) {
    var args = arguments
    var div = document.createElement('div')
    var i = 1

    div.innerHTML = html.replace(/%([se])/g, function (_, type) {
      switch (type) {
        case 's':
          return String(args[i++])
        case 'e':
          return utils.escape(args[i++])
        // no default
      }
    })

    return div.firstChild
  }

  // Flag as browser only
  Reporter.browserOnly = true

  // export reporter
  return Reporter
}))
