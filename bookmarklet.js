javascript:(function(d, r){
  r.forEach(function(n){
    var s=d.createElement('script');
    s.src='//cdnjs.cloudflare.com/ajax/libs/' + n + '.min.js';
    d.body.appendChild(s);
  })
})(document, [
  'jquery/3.4.1/jquery',
  'async/3.0.1/async',
  'utf8/3.0.0/utf8',
  'downloadjs/1.4.8/download'
], '')