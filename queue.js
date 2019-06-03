/**
 * Handles loading lots of URLs and saving the data
 */

/* global jQuery */

function DownloadQueue (concurrent) {
  /**
   * Max requests running in parallel
   * @var {Number}
   */
  this.concurrent = concurrent || 5

  /**
   * Requests in progress
   * @var {Number}
   */
  this.active = 0

  /**
   * Ajax request configs
   * @var {Object[]}
   */
  this.tasks = []

  /**
   * Store downloaded data
   * @var {Object}
   */
  this.data = {}
}

DownloadQueue.prototype = {

  /**
   * Run task or nothing if it is busy
   */
  _run: function () {
    if (this.active === this.concurrent || !this.tasks.length) {
      return
    }

    this.active++
    (this.tasks.shift())()
    this._run()
  },

  /**
   * Add an ajax request to the queue
   * @param {String|Object} config ajax config
   */
  push: function (config) {
    var queue = this

    this.tasks.push(function () {
      jQuery.get(config).done(function (data) {
        queue.data[this.url] = data
        queue.active--
        queue._run()
      })
    })

    this._run()
  }
}
