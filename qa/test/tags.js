/* global describe, it, data */

describe('Tags (keywords)', function () {
  it('should not have no tags')
  it('should have same number of tags on both languages')
  it('should not have featured tags')
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
