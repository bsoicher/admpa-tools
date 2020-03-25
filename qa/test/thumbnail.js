

describe('Thumbnail image', function() {

    it('should not be an in article image', function() {
        if(data.meta['gcOGImage']) {
            data.meta['gcOGImage'].should.not.match('/_jcr_content/')
        }
    })
})

/*
function (d) {
    var a = d.jcr['gcOGImage']
    var b = d.jcr_alt['gcOGImage']

    assert(a, 'Metadata: Thumbnail image (social media) not set')
    assert(a.startsWith('/content/dam/'), 'Metadata: Thumbnail image (social media) path is not in the DAM')
    assert(!a.includes('/_jcr_content/'), 'Metadata: Thumbnail image (social media) should not be coppied from within the article')
    assert(a === b, 'Metadata: Thumbnail image (open graph) does not match between languages')

    pass('Metadata: Thumbnail image passed tests')
},*/