/* global describe, it, expect  */

describe('Hello world', function () {

  before(function(){

    //this.skip()

  })

  it('should be a string', function () {
    expect('Hello world').to.be.a('string')
  })

  it('should be 11 characters long', function () {
    expect('Hello world').to.have.length(11)
  })

  it('should end with world', function () {
    expect('Hello world').to.match(/world$/)
  })

  describe('Hello world part 2', function () {
    it('should end with test', function () {
      expect('Hello world').to.match(/test$/)
    })

    it('should end with test2', function () {
      expect('Hello world').to.match(/test2$/)
    })
  })
  
  it('test')
})

describe('Hello world timed', function () {

  it('should be string in half a second', function (done) {
    setTimeout(function () {
      expect('Hello world').to.be.a('string')
      done()
    }, 500)
  })

  it('should be string in 1 second', function (done) {
    setTimeout(function () {
      expect('Hello world').to.be.a('string')
      done()
    }, 1000)
  })

  it('should be string in 1 second', function (done) {
    setTimeout(function () {
      expect('Hello world').to.be.a('number')
      done()
    }, 1000)
  })

  it('test')
})
