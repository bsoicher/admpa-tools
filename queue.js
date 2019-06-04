/**
 * Handles loading lots of URLs and saving the data
 */

/* global $ */

function DownloadQueue (concurrent) {
  this.concurrent = concurrent || 1
  this.active = 0
  this.tasks = []
  this.data = {}
}

DownloadQueue.prototype = {

  _run: function () {
    if (this.active === this.concurrent || !this.tasks.length) {
      return
    }

    if (!this.active && !this.tasks.length) {
      $(this).trigger('done')
    }

    this.active++
    (this.tasks.shift())()
    this._run()
  },

  push: function (config) {
    var queue = this

    this.tasks.push(function () {
      $.get(config).done(function (data) {
        queue.data[this.url] = data
        queue.active--
        queue._run()
      })
    })

    this._run()
  },

  done: function (cb) {
    $(this).on('done', cb)
  }
}
