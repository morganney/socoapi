socoapi
=======

Want to create a custom look for social media buttons from Facebook, Twitter and Google?  Are you tired of the vendor
supplied widget styles when you use their embed scripts?

socoapi is a JSON API for obtaining share counts of your website on social media sites like Facebook,
Twitter, Google+ and Pinterest.  Install socoapi on your server so your website can use custom styles for share
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

**GET /counts?```url```=[the url to get share counts for]**

Returns share counts for ```url``` from all supported vendors.

```javascript
{
  "facebook" : 1234,
  "twitter"  : 4321,
  "google"   : 5317,
  "pinterest": 1,
}
```

**GET /counts/```:vendor```?```url```=[the url to get share counts for]**

Returns share counts for ```url``` from supplied ```:vendor```.

For example, ```GET /counts/facebook?url=http://www.foobar.baz/```

```javascript
{
  "facebook" : 123
  "url" : "http://www.foobar.baz/"
}
```

### License

MIT
