


describe('Content links', function() {

    it('?should not link to WordPress server', function () {
        data.doc.find('a[href*=".mil.ca"').should.have.lengthOf(0)
    })

    it('?something that should be a warning', function () {
        expect(1 + 1).to.equal(3)
    })

})

/*
 function (d) {
    var a = d.$doc.find('a[href*=".mil.ca"').length
    assert(a === 0, 'Content: ' + a + ' intranet links found')
    pass('Content: Intranet links were not found')
},

function (d) {
    var a = d.$doc.find('a[href*="caf-fac.ca"]').length
    assert(a === 0, 'Content: ' + a + ' Links to caf-fac.ca found')
    pass('Content: Links to "caf-fac.ca" were not found')
},*/