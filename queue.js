

function DownloadQueue(concurrent) {

  /**
   * Max requests running in parallel
   * @var {Number}
   */
  this.concurrent = concurrent || 5;

  /**
   * Requests in progress
   * @var {Number}
   */
  this.active = 0;

  /**
   * URLs to be downloaded
   * @var {Object[]}
   */
  this.tasks = [];


  //this.timer = setInterval(this._run, 500)

}

DownloadQueue.prototype = {

  _run: function() {

    if (this.active >= this.concurrenct || !this.tasks.length) {
      return
    }

    this.tasks.shift().call(null)

    this.active++

    this._run()
  },

  isEmpty: function() {
    return Boolean(this.tasks.length)
  },

  push: function(url) {

    var i = this
    this.tasks.push(function() {
      jQuery.get(url).done(function(){
        i
      })
    })

    this._run()
  }
}

var queue = new DownloadQueue()

queue.push('https://www.canada.ca/en/department-national-defence/test/maple-leaf/ops/2019/05/_jcr_content.json')
queue.push('https://www.canada.ca/en/department-national-defence/test/maple-leaf/ops/2019/05/_jcr_content.json')
queue.push('https://www.canada.ca/en/department-national-defence/test/maple-leaf/ops/2019/05/_jcr_content.json')
queue.push('https://www.canada.ca/en/department-national-defence/test/maple-leaf/ops/2019/05/_jcr_content.json')
queue.push('https://www.canada.ca/en/department-national-defence/test/maple-leaf/ops/2019/05/_jcr_content.json')
queue.push('https://www.canada.ca/en/department-national-defence/test/maple-leaf/ops/2019/05/_jcr_content.json')
queue.push('https://www.canada.ca/en/department-national-defence/test/maple-leaf/ops/2019/05/_jcr_content.json')
queue.push('https://www.canada.ca/en/department-national-defence/test/maple-leaf/ops/2019/05/_jcr_content.json')