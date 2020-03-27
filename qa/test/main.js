/* global runner, url, $, expect, describe, it */




var data = {}


describe('Initialize', function () {

  it('node URL validated', function (done) {

    try {
      console.log(/^https?\/\/[^/]+\//.exec(url)) //.should.equal('https://www.canada.ca/', 'domain name')
      url.split('.').pop().should.equal('html', 'file extension')
    } catch (err) {
      runner.abort()
      throw err
    }

    $.ajax(url).done(function (meta) {
      data.meta = meta
      done()
    }).fail(function (r) {
      runner.abort()
      throw r.statusText
    })

  })

 

  it('should load alt metadata', function () {
    console.log(data)
    expect(data.meta).to.exist
  })

  /*
  it('should load alt metadata', function () {
    $.ajax(data.url).done(function (data) {
      data.meta = data
      done()
    }).fail(function (xhr, status, err) {
      assert.fail(err)
    })
  })*/

})


