var DRY    = require('./dry')
  , cache  = require('memory-cache')
  , urlrgx = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/
  , api    = {}
;

/**
 * Returns counts for all supported vendors.  If a vendor api returns an error, the count returned from
 * socoapi is 'null'.
 *
 * @param req
 * @param res
 */
api.all = function(req, res) {
  var counts = {
      facebook    : null,
      twitter     : null,
      google      : null,
      pinterest   : null,
      url         : null
    }
    , url           = req.query.url
    , cachekey      = JSON.stringify({key: url})
    , cached_counts = cache.get(cachekey)
  ;

  if(DRY.c.caching && cached_counts !== null) {
    res.json(200, cached_counts);
  } else {
    if(urlrgx.test(req.query.url)) {
      counts.url = url;
      // Get social media counts, continuing through errors until all are attempted.
      DRY.vendor.pinterest(url).then(function(count) {
        counts.pinterest = count;
        return DRY.vendor.facebook(url);
      }).catch(function(e) {
          console.log('Pinterest request failed.');
          return DRY.vendor.facebook(url);
        }).then(function(count) {
          counts.facebook = count;
          return DRY.vendor.twitter(url);
        }).catch(function(e) {
          console.log('Facebook request failed.');
          return DRY.vendor.twitter(url);
        }).then(function(count) {
          counts.twitter = count;
          return DRY.vendor.google(req.query.url);
        }).catch(function(e) {
          console.log('Twitter request failed.');
          return DRY.vendor.google(url);
        }).then(function(count) {
          counts.google = count;
          // No more vendors counts to fetch
        }).catch(function(e) {
          console.log('Google request failed.');
        }).then(function() {
          cache.put(cachekey, counts, DRY.c.cachettl);
          res.json(200, counts);
        });
    } else res.json(400, DRY.errors.get(400, 'A valid URL is required.'));
  }
};

/**
 * Returns share counts for specified vendor if supported.
 *
 * @param req
 * @param res
 */
api.get = function(req, res) {
  var url = req.query.url
    , cachekey = JSON.stringify({key: req.params.vendor + url})
    , cached_vendor = cache.get(cachekey)
  ;

  if(DRY.c.caching && cached_vendor) {
    res.json(200, cached_vendor);
  } else {
    if(urlrgx.test(req.query.url)) {
      if(typeof DRY.vendor[req.params.vendor] === 'function') {
        DRY.vendor[req.params.vendor](url).then(function(count) {
          var json = {count: count, vendor: req.params.vendor, url: url};

          cache.put(cachekey, json, DRY.c.cachettl);
          res.json(200, json);
        }).catch(function(e) {
            res.json(200, {count: null, message: 'Request failed.', vendor: req.params.vendor});
          });
      } else res.json(400, DRY.errors.get(400, "Vendor '" + req.params.vendor + "' is not supported by this API."));
    } else res.json(400, DRY.errors.get(400, 'A valid URL is required.'));
  }
};

module.exports = api;