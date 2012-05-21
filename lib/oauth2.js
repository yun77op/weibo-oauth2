var https = require('https')
  , url = require('url')
  , util = require('./util')
  , fs = require('fs');

var OAuth2 = module.exports = function(config) {
  this.config = util.extend({}, OAuth2.defaults, config);
  this._nonce_chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
}

OAuth2.defaults = {
  authorize_path: '/oauth2/authorize',
  access_path: '/oauth2/access_token'
};

var p = OAuth2.prototype;

p.getAuthorizeUrl = function() {
  var config = this.config
    , authorizeUrl = url.resolve(config.base_uri, config.authorize_path);

  return util.addUrlParam(authorizeUrl, {
    client_id: config.key,
    response_type: 'code',
    redirect_uri: config.redirect_uri
  });
};

p.getAccessToken = function(code, callback) {
  var config = this.config
    , options = {
        path: config.access_path,
        method: 'POST'
      }
    , params = {
        client_id: config.key,
        client_secret: config.secret,
        grant_type: 'authorization_code',
        redirect_uri: config.redirect_uri,
        code: code
      };

  this.request(options, params, function(err, data) {
    callback(err, data);
  });
};

/**
 * 不同的参数组合
 *
 * 1.  options, params, callback
 * 2.  options, callback
 * 3.  options, accessToken, callback
 * 4.  options, params, accessToken, callback
 * 5.  options, params, accessToken, multi, callback
 */
p.request = function (options, params, accessToken, multi, callback) {
  var args = Array.prototype.slice.call(arguments, 1)
    , config = this.config
    , parsedUrl, hasPostBody
    , postBody, req
    , headers = {
      'content-type': 'application/x-www-form-urlencoded'
    };

  callback = args.pop();
  params = args.shift();

  if (typeof multi != 'boolean' || multi == undefined) {
    multi = false;
  }

  if (typeof params == 'string') {
    accessToken = params;
    params = {};
  } else if (typeof accessToken == 'function') {
    accessToken = null;
  }

  parsedUrl = url.parse(config.base_uri);
  options.host = options.host || parsedUrl.hostname;
  options.method = options.method || 'GET';
  options.method = options.method.toUpperCase();
  options.port = options.port || 443;

  if (accessToken) {
    params.access_token = accessToken;
  }

  if (options.method == 'GET') {
    options.path = util.addUrlParam(options.path, params);
  } else if (!util.isEmptyObject(params)) {
    if (multi) {
      this.getUniqueBoundary();
      headers['content-type'] = 'multipart/form-data; boundary=' + this.boundary;
    }

    hasPostBody = true;
    postBody = this.getBody(params, multi);
  }


  util.extend(headers, {
    'host': options.host,
    'content-length': hasPostBody ? (typeof postBody == 'string' ? Buffer.byteLength(postBody) : postBody.length) : 0
  });

  options.headers = util.extend({}, options.headers, headers);

  req = https.request(options, function (res) {
    var result = '';

    res.setEncoding('utf8');

    res.on('data', function (chunk) {
      result += chunk;
    });

    res.on('end', function () {
      var data = JSON.parse(result);

      if (res.statusCode != 200 && res.statusCode != 301 && res.statusCode != 302) {
        callback({ statusCode: res.statusCode, data: data });
      } else {
        callback(null, data);
      }
    });
  });

  req.on('error', function(e) {
    callback(e);
  });

  if (hasPostBody) {
    req.write(postBody);
  }

  req.end();
};

p.getUniqueBoundary = function() {
  var result = '', length = 10
    , cLength = this._nonce_chars.length;

  for (var i = 0; i < length;i++) {
    var rnum = Math.floor(Math.random() * cLength);
    result += this._nonce_chars.substring(rnum, rnum+1);
  }

  this.boundary = '----boundary' + result;

  return this;
};

p.getBody = function(params, multi) {
  if (!multi) {
    return util.stringify(params);
  }

  var value, i
    , crlf = '\r\n'
    , dashdash = '--'
    , postBody = ''
    , boundary = this.boundary
    , mBoundary = dashdash + boundary
    , endBoundary = crlf + mBoundary + dashdash + crlf;

  for (i in params) {
    value = params[i];

    if (i != 'pic') {
      postBody += mBoundary + crlf;
      postBody += 'Content-Disposition: form-data; name="' + i + '"' + crlf + crlf;
      postBody += value + crlf;
    }
  }

  var imgPath = params['pic']
    , fileName = imgPath.split(/\\|\//).pop()
    , imgBuffer = fs.readFileSync(imgPath);

  postBody += mBoundary + crlf;
  postBody += 'Content-Disposition: form-data; name="pic"; filename="' + fileName + '"' + crlf;
  postBody += 'Content-Type: image/unknown' + crlf + crlf;

  var currentBufferLength = Buffer.byteLength(postBody)
    , totalSize = currentBufferLength + imgBuffer.length + endBoundary.length
    , postBodyBuffer = new Buffer(totalSize)
    , offset = 0;

  postBodyBuffer.write(postBody);
  offset += currentBufferLength ;
  imgBuffer.copy(postBodyBuffer, offset);
  offset += imgBuffer.length;
  postBodyBuffer.write(endBoundary, offset);

  return postBodyBuffer;
}