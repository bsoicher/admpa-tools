

var https = require('https')
var parse = require('xml2js').parseString


var xml = "<root>Hello xml2js!</root>"

var r = https.request('https://www.canada.ca/en/department-national-defence/test/maple-leaf.sitemap.xml');

r.on('request', function (res) {
    console.log(res)
})

