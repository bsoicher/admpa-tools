/* global describe, before, it, data */

describe('Tags (keywords)', function () {
  before(function () {
    data.meta.tags = data.meta['gcKeywords'] ? data.meta['gcKeywords'].split(',').map(function (tag) { return tag.trim() }) : []
    data.meta.alt.tags = data.meta.alt['gcKeywords'] ? data.meta['gcKeywords'].split(',').map(function (tag) { return tag.trim() }) : []
  })

  it('Has at least one tag', function () {
    data.meta.tags.should.not.be.empty
  })

  it('Number of tags matches between languages', function () {
    data.meta.tags.length.should.equal(data.meta.alt.tags.length)
  })

  it('should not have featured tags')

  it('"Regional round-up" was renamed to "Regional stories"', function () {
    data.meta.should.not.match(/regional round[- ]?up/i)
  })
})

/*
 function (d) {
    var a = d.jcr['gcKeywords']
    var b = d.jcr_alt['gcKeywords']

    assert(a, 'Metadata: Keywords (tags) not set')

    function taglist(tags) {
        return tags.split(',').map(function (tag) {
            return tag.trim()
        }).filter(function (tag) {
            return tag ? !tag.match(/(featured|vedette)$/i) : false
        })
    }

    a = taglist(a)
    b = taglist(b)

    assert(a.length === b.length, 'Metadata: Keywords (tags), different number of tags between languages (' + a.length + ' vs ' + b.length + ')')

    pass('Metadata: Keywords (tags) passed 2 tests')
},
*/
