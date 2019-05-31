
function sitemap_url() {

}






function format_date(date) {

}



function get_date(jcr) {

    


}


function get_url_language(url) {

}

/**
 * Defines how an article URL is structured
 * @var {RegExp}
 */
var match_article = /\/\d{4}\/\d{2}\/[^.]*\.html$/i

/**
 * Test if a url matches an article path structure
 * @param {String} url URL to test
 * @returns {Boolean}
 */
function is_article(url) {
    match_article.test(url)
}

/**
 * Converts XML sitemap into JSON
 * @param {String} xml XML string
 * @returns {String}
 */
function filter_xml(xml) {

  // Use jQuery to convert XML to DOM structure
  xml = jQuery(jQuery.parseXML(data))

  // Extract URLs, ignores non articles
  var list = xml.find('loc').map(function () {
    return is_article(this.innerHTML) ? this.innerHTML : null
  }).get()

  // Convert back to string
  return JSON.stringify(list)
}

/**
 * Converts jcr:content data into JSON
 * @param {String} json 
 */
function filter_jcr(json) {

  // Parse JSON string
  json = JSON.parse(json)

  var obj = {}
  var lang = json['jcr:language']

  // Remap object keys
  
  obj['title-' + lang] = '<a href="' + (url || alt) + '">' + utf8.encode(data['jcr:title']) + '</a>'

  obj['desc-' + lang] = utf8.encode(data['gcDescription'])
  obj['keywords-' + lang] = utf8.encode(data['gcKeywords'])
  obj['thumb'] = '<img src="' + data['gcOGImage'] + '" width="100%"/>'

  var iso = new Date(data['gcIssued']).toISOString()
  obj['published'] = iso.substr(0, 10) + '<span class="hidden">' + iso.substr(10) + '</span>'

  if (!alt) {
    obj['alt'] = data['gcAltLanguagePeer'].replace('/content/canadasite/', 'https://www.canada.ca/')
  }

  // Convert back to string
  return JSON.stringify(obj)
}