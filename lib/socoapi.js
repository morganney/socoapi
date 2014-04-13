var http      = require('http')
  , logger    = require('morgan')
  , errhndlr  = require('errorhandler')
  , compress  = require('compression')
  , express   = require('express')
  , DRY       = require('./dry')
  , app       = express()
  , proxy     = http.createServer(app)
  , env       = process.env.NODE_ENV || 'development'
  , socoapi   = {}
;

// Middleware
if(env === 'development') {
  app.use(logger('dev'));
  app.use(errhndlr({showStack: true, dumpExceptions: true}));
  app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.json(500, DRY.errors.get(500, 'The server encountered an unexpected condition: ' + err.message));
  });
} else {
  app.use(logger());
  app.use(function(err, req, res, next) {
    res.json(500, DRY.errors.get(500, 'The server encountered an unexpected condition: ' + err.message));
  });
}
app.use(compress({threshold: false}));

// Routing
app.get('/counts', function(req, res) {
  DRY.get({
    network: {
      hostname: 'graph.facebook.com',
      headers:  {'accept-encoding':'gzip,deflate'},
      path: '/?id=http://www.live365.com'
    }
  }).then(function(js) {
      var json = {}
      ;
      // Content-type text/javascript response from facebook
      try {
        json = JSON.parse(js);
      } catch(e) {

      }
     res.json(200, json);
  });
  //res.json(200, {content: 'hello world', url: req.query.url});
});
app.get('/counts/:vendor', function(req, res) {
  res.json(200, {content: 'You want ' + req.params.vendor, url: req.query.url});
});

// Non-routed Requests (404's, etc.)
app.use(function(req, res, next) {
  var method = req.method;

  if(method.toLowerCase() !== 'get') {
    res.json(405, DRY.errors.get(405, 'HTTP method ' + method + ' is not supported by this API.'));
  } else {
    res.json(404, DRY.errors.get(404, 'The requested URI can not be found on this server.'));
  }
});

// Start public API

/**
 *
 * @param port
 * @param callback
 */
socoapi.listen = function(port, callback) {
  proxy.listen(port, function() {
    callback(port);
  });
};

module.exports = socoapi;