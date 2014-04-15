var DRY    = require('./dry')
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
  ;

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
      res.json(200, counts);
    });
  } else res.json(400, DRY.errors.get(400, 'A valid URL is required.'));

};

api.get = function(req, res) {
  if(urlrgx.test(req.query.url)) {
    if(typeof DRY.vendor[req.params.vendor] === 'function') {
      DRY.vendor[req.params.vendor](req.query.url).then(function(count) {
        res.json(200, {count: count, vendor: req.params.vendor});
      }).catch(function(e) {
        res.json(200, {count: null, message: 'Request failed.', vendor: req.params.vendor});
      });
    } else res.json(400, DRY.errors.get(400, "Vendor '" + req.params.vendor + "' is not supported by this API."));
  } else res.json(400, DRY.errors.get(400, 'A valid URL is required.'));
};

module.exports = api;