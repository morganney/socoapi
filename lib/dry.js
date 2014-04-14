var http    = require('http')
  , zlib    = require('zlib')
  , Promise = require('es6-promise').Promise
  , dry     = {}
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
 * Promise returning wrapper around http.request.
 * Specifically checks HTTP status code from request and rejects the Promise
 * based on the status code.
 *
 * @param options
 * @returns {Promise}
 */
dry.get = function(options) {
  return new Promise(function(resolve, reject) {
    var req = http.request(options, function(res) {
      var encoding  = res.headers['content-encoding']
        , status    = res.statusCode
        , stream    = res
        , data      = ''
      ;

      if(encoding === 'gzip' || encoding === 'deflate') {
        stream = zlib.createUnzip();
        res.pipe(stream);
      }

      stream.on('error', function(e) {
        console.error(e.stack);
        reject(e);
      });

      stream.on('data', function(d) {
        if(d) {
          data += d.toString();
        }
      });

      stream.on('end', function() {
        if(status < 200 || (status >= 300 && status !== 304)) {
          reject({message: 'Vendor HTTP status error.', vendorStatus: status, data: data});
        } else resolve(data);
      });

    });

    req.on('error', function(e) {
      var host = options.hostname || options.host
      ;

      console.error(e.stack);
      reject(new Error('Unable to make request to ' + host + options.path));
    });

    req.end();
  });
};

dry.vendor = {
  twitter: function(url) {
    return dry.get({
      network: {
        hostname: 'cdn.api.twitter.com',
        headers:  {'accept-encoding':'gzip,deflate'},
        path: '/1/urls/count.json?url=' + url
      }
    });
  },
  facebook: function(url) {
    return new Promise(function(resolve, reject) {
      dry.get({
        hostname: 'graph.facebook.com',
        headers:  {'accept-encoding':'gzip,deflate'},
        path: '/?id=' + url
      }).then(function(json) {

      }).catch(function(e) {

      });
    });
  },
  pinterest: function(url) {
    return new Promise(function(resolve, reject) {
      dry.get({
        hostname: 'api.pinterest.com',
        headers:  {'accept-encoding':'gzip,deflate'},
        path: '/v1/urls/count.json?callback=_&url=' + url
      }).then(function(json) {
        var parseErr = false
          , obracket = undefined
          , cbracket = undefined
        ;

        //json = JSON.stringify(json);
        obracket = json.indexOf('{');
        cbracket = json.lastIndexOf('}');
        json = json.substring(obracket, cbracket + 1);

        try {
          json = JSON.parse(json);
        } catch(e) {
          parseErr = true;
        } finally {
          if(!parseErr) {
            if(!json.error) resolve({count: json.count});
            else reject(new Error(json.error));
          } else reject(new Error('JSON parse error.'));
        }
      }).catch(function(e) { reject(e);});
    });
  }
};

module.exports = dry;