
/**
 * Custom Mocha reporter
 * @see https://mochajs.org/api/tutorial-custom-reporter.html
 */
(function (root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory(require('mocha'), require('jquery'))
  } else {
    root.QA = factory(root.Mocha, root.jQuery)
  }
}(this, function (Mocha, $) {
  var Base = Mocha.reporters.Base
  var constants = Mocha.Runner.constants

  /**
   * Construct a new reporter instance
   * @extends Mocha.reporters.Base
   * @param {Runner} runner - Instance triggers reporter actions.
   * @param {Object} [options] - runner options
   */
  function QA (runner, options) {
    var stats = runner.stats

    // Call the Base mocha reporter
    Base.call(this, runner, options)

    var root = $('#mocha')
    var report = $('<ul id="mocha-report" class="list-unstyled"></ul>').appendTo(root)

    if (!root) {
      return console.error('#mocha div missing, add it to your document')
    }

    $(document).on('click', '#view-passes', function () {
      $('.fail,.pending,.suite:not(:has(.pass))').hide()
      $('.pass,.suite:has(.pass)').show()
    })

    $(document).on('click', '#view-failures', function () {
      $('.pass,.pending,.suite:not(:has(.fail))').hide()
      $('.fail,.suite:has(.fail)').show()
    })

    $(document).on('click', '#view-pending', function () {
      $('.pass,.fail,.suite:not(:has(.pending))').hide()
      $('.pending,.suite:has(.pending)').show()
    })

    $(document).on('click', '#view-all', function () {
      $('.test,.suite').show()
    })

    runner.on(constants.EVENT_SUITE_BEGIN, function (suite) {
      suite.root = suite.root === true ? report : $('<li class="suite"><h2 class="h5">' + suite.title + '</h2><ul class="list-unstyled ml-4"></ul></li>').appendTo(suite.parent.root).find('ul')
    })

    runner.on(constants.EVENT_SUITE_END, function (suite) {
      updateStats()
    })

    runner.on(constants.EVENT_TEST_PASS, function (test) {
      console.log(test)
      $('<li class="test pass"><strong class="text-success">✓</strong> ' + test.title + '</li>').appendTo(test.parent.root)
      updateStats()
    })

    runner.on(constants.EVENT_TEST_FAIL, function (test) {
      var message = test.err.toString()

      if (message === '[object Error]') {
        message = test.err.message
      }

      $('<li class="test fail"><strong class="text-danger">✕</strong> ' + test.title + ' >> ' + message + '</li>').appendTo(test.parent.root)

      updateStats()
    })

    runner.on(constants.EVENT_TEST_PENDING, function (test) {
      $('<li class="test pending"><span class="text-warning" title="Skipped">&#10033;</span> ' + test.title + '</li>').appendTo(test.parent.root)
      updateStats()
    })

    runner.on(constants.EVENT_RUN_END, function () {
      updateStats()
    })

    function updateStats () {
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

  // Flag as browser only
  QA.browserOnly = true

  // export reporter
  return QA
}))
