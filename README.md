socoapi
=======

Want to create a custom look for social media buttons from Facebook, Twitter and Google?  Are you tired of the vendor
supplied widget styles when you use their embed scripts?

socoapi is a JSON API for obtaining share counts of your website on social media sites like Facebook,
Twitter, Google+ and Pinterest.  Install socoapi on your server so your website can use custom styles for share
buttons hosted on your pages.

## Installation
```javascript
npm install socoapi
```
### Usage
```socoapi``` provides one method: ```listen(port, cachettl [, callback])```. All parameters are required except for ```callback```. Passing a value of ```false``` for ```cachettl``` will force socoapi to not use caching and each request will get the counts from the vendor's server.

I would probably enable caching by passing in a milliseconds value for ```cachettl``` to not overburden the vendor's servers with your super popular website.

```javascript
// Standalone
var socoapi = require('socoapi');

socoapi.listen('3535', 3600000, function(port, ttl) {
  console.log('socoapi now listening on port ' + port + ' with cache ttl of ' + ttl + ' ms');
});

socoapi.listen('3535', false, function(port, ttl) {
  // Passing false will disable caching which is enabled by default.
});

// Embedded
var app     = require('express')()
  , socoapi = require('socoapi')
;

app.enable('trust proxy');
app.listen('3000', function() {
  socoapi.listen('3535', 3600000, function() {
    console.log('socoapi api now listening ...');
  });
});

```
