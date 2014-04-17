var DRY    = require('./dry')
  , cache  = require('memory-cache')
  , urlrgx = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
  , api    = {}
;

api.all = function(req, res) {
  var counts = {
      facebook    : null,
      twitter     : null,
      google      : null,
      pinterest   : null,
      url         : null
    }
    , cached_counts = cache.get('counts')
  ;

  if(DRY.c.caching && cached_counts !== null) {
    res.json(200, cached_counts);
  } else {
    if(urlrgx.test(req.query.url)) {
      counts.url = req.query.url;
      // Get social media counts, continuing through errors until all are attempted.
      DRY.vendor.pinterest(req.query.url).then(function(count) {
        counts.pinterest = count;
        return DRY.vendor.facebook(req.query.url);
      }).catch(function(e) {
          console.log('Pinterest request failed.');
          return DRY.vendor.facebook(req.query.url);
        }).then(function(count) {
          counts.facebook = count;
          return DRY.vendor.twitter(req.query.url);
        }).catch(function(e) {
          console.log('Facebook request failed.');
          return DRY.vendor.twitter(req.query.url);
        }).then(function(count) {
          counts.twitter = count;
          return DRY.vendor.google(req.query.url);
        }).catch(function(e) {
          console.log('Twitter request failed.');
          return DRY.vendor.google(req.query.url);
        }).then(function(count) {
          counts.google = count;
          // No more vendors counts to fetch
        }).catch(function(e) {
          console.log('Google request failed.');
        }).then(function() {
          cache.put('counts', counts, DRY.c.cachettl);
          res.json(200, counts);
        });
    } else res.json(400, DRY.errors.get(400, 'A valid URL is required.'));
  }


};

api.get = function(req, res) {
  var cached_vendor = cache.get(req.params.vendor);

  if(DRY.c.caching && cached_vendor) {
    res.json(200, cached_vendor);
  } else {
    if(urlrgx.test(req.query.url)) {
      if(typeof DRY.vendor[req.params.vendor] === 'function') {
        DRY.vendor[req.params.vendor](req.query.url).then(function(count) {
          var json = {count: count, vendor: req.params.vendor};

          cache.put(req.params.vendor, json, DRY.c.cachettl);
          res.json(200, json);
        }).catch(function(e) {
            res.json(200, {count: null, message: 'Request failed.', vendor: req.params.vendor});
          });
      } else res.json(400, DRY.errors.get(400, "Vendor '" + req.params.vendor + "' is not supported by this API."));
    } else res.json(400, DRY.errors.get(400, 'A valid URL is required.'));
  }
};

module.exports = api;