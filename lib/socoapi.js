var http      = require('http')
  , logger    = require('morgan')
  , errhndlr  = require('errorhandler')
  , compress  = require('compression')
  , express   = require('express')
  , DRY       = require('./dry')
  , api       = require('./api')
  , app       = express()
  , proxy     = http.createServer(app)
  , env       = process.env.NODE_ENV || 'development'
  , socoapi   = {}
;

// Middleware & Config
app.enable('trust proxy');
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
app.use(function(req, res, next) {
  if(req.method.toLowerCase() === 'options') {
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Content-Length,X-Requested-With',
      'Access-Control-Allow-Credentials': false,
      'Allow': 'GET'
    });
    res.send(200);
  } else {
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Expires': 'Sat, 01 Jan 2000 08:00:00 GMT',
      'Last-Modified': new Date().toUTCString(),
      'Cache-Control': 'max-age=0, no-cache, must-revalidate, proxy-revalidate',
      'Content-Type': 'application/json; charset=utf-8'
    });
    next();
  }
});

// Routing
app.get('/counts', api.all);
app.get('/counts/:vendor', api.get);

// Non-routed Requests (404's, etc.)
app.use(function(req, res, next) {
  var method = req.method;

  if(method.toLowerCase() !== 'get') {
    res.json(405, DRY.errors.get(405, 'HTTP method ' + method + ' is not supported by this API.'));
  } else {
    res.json(404, DRY.errors.get(404, 'The requested URI can not be found on this server.'));
  }
});

/**
 * Public api for socoapi nodejs clients.  Simply require then listen().
 * Starts the actual proxy server behind socoapi.
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