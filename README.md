socoapi
=======

Want to create a custom look for social media buttons from Facebook, Pinterest and Google?  Are you tired of the vendor
supplied widget styles when you use their embed scripts?

socoapi is a JSON API for obtaining share counts of your website on social media sites like Facebook,
Pinterest, and Google+.  Install socoapi on your server so your website can use custom styles for share
buttons hosted on your pages.

### Installation
```javascript
npm install socoapi
```
### Usage
Start the ```socoapi``` server before you use the API.

```socoapi``` provides one method: ```listen(port, cachettl [, callback])```.

All parameters are required except for ```callback```. Passing a value of ```false``` for ```cachettl``` will force socoapi to not use caching and each request will get the counts from the vendor's server. Cached values are removed after ```cachettl``` milleseconds and refreshed on the next request.

Supplying a ```cachettl``` is recommended to not overburden any vendor server needlessly.

```javascript
// Standalone
var socoapi = require('socoapi');

socoapi.listen('3535', 3600000, function(port, ttl) {
  console.log('socoapi now listening on port ' + port + ' with cache ttl of ' + ttl + ' ms');
});

// Embedded
var app     = require('express')()
  , socoapi = require('socoapi')
;

// If using a reverse proxy
app.enable('trust proxy');

app.listen('3000', function() {
  socoapi.listen('3535', 3600000, function() {
    console.log('socoapi api now listening ...');
  });
});

```

### API

*Be sure to URI encode (percent encoding) any query component to a URL*.

**GET /counts?```url```=[the url to get share counts for]**

Returns share counts for ```url``` from all supported vendors.

For example, ```GET /counts?url=http://www.foobar.baz/%3Fq1%3Dv1%26q2%3Dv2```

```javascript
{
  "facebook" : 1234,
  "google"   : 5317,
  "pinterest": 1,
  "url"      : "http//www.foobar.baz/?q1=v1&q2=v2"
}
```

**GET /counts/```:vendor```?```url```=[the url to get share counts for]**

Returns share counts for ```url``` from supplied ```:vendor```.

For example, ```GET /counts/facebook?url=http://www.foobar.baz/```

```javascript
{
  "count" : 123
  "vendor" : "facebook"
}
```

### License

MIT
