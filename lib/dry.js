var dry     = {}
  , http    = require('http')
  , zlib    = require('zlib')
  , Promise = require('es6-promise').Promise
;


dry.errors = (function() {
  var error = {};

  return {
    get: function(status, msg) {
      switch(parseInt(status, 10)) {
        case 400:
          this.set(400, 'Bad Request', msg);
          break;
        case 404:
          this.set(404, 'Not Found', msg);
          break;
        case 405:
          this.set(405, 'Method Not Allowed', msg);
          break;
        case 500:
          this.set(500, 'Internal Server Error', msg);
          break;
        case 503:
          this.set(503, 'Service Unavailable', msg);
          break;
        default:
          this.set(
            500,
            'Internal Server Error',
            'The server encountered an unexpected condition which prevented it from fulfilling the request.'
          );
          break;
      }

      return error;
    },
    set: function(status, desc, msg) {
      error.status = status;
      error.statusDesc = desc;
      error.message = msg || 'HTTP Error.';
    }
  };

}());

/**
 * @TODO: I need to see the response status from the remote server
 *
 * @param options
 * @returns {Promise}
 */
dry.get = function(options) {
  var ops = options.network
  ;

  return new Promise(function(resolve, reject) {
    var req = http.request(ops, function(res) {
      var encoding  = res.headers['content-encoding']
        , stream    = res
        , data      = ''
      ;

      //console.dir(res.headers);
      if(encoding === 'gzip' || encoding === 'deflate') {
        stream = zlib.createUnzip();
        res.pipe(stream);
      }

      stream.on('error', function(e) {
        console.error(e.stack);
        reject(new Error(e.message));
      });

      stream.on('data', function(d) {
        if(d) {
          data += d.toString();
        }
      });

      stream.on('end', function() {
        resolve(data);
      });

    });

    req.on('error', function(e) {
      reject(new Error(e.message));
    });

    req.end();
  });
};

module.exports = dry;