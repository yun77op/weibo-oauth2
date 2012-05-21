var OAuth2 = require('../../../lib/oauth2')
  , config = require('../config')
  , oauth2 = new OAuth2(config.oauth2)
  , async = require('async');

exports.index = function(req, res) {
  if (req.session.user) {
    res.redirect('/app');
  } else {
    res.render('index', { title: '登录' });
  }
};

exports.authorize = function(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/');
  }
};

exports.login = function(req, res) {
  var authorizeUrl = oauth2.getAuthorizeUrl();
  res.redirect(authorizeUrl);
};

exports.callback = function(req, res, next) {
  var code = req.query.code;

  async.waterfall([
    function(callback) {
      oauth2.getAccessToken(code, callback);
    },

    function(oauthRet, callback) {
      var uid = oauthRet.uid;

      oauth2.request({
          path: '/users/show.json'
        }, {
          uid: uid
        },
        oauthRet.access_token,
        function(err, user) {
          callback(err, oauthRet, user);
        }
      );
    },

    function(oauthRet, user, callback) {
      var uid = oauthRet.uid;

      req.session.maxAge = oauthRet.expires_in * 1000;
      req.session.access_token = oauthRet.access_token;
      req.session.user = {
        id: uid,
        name: user.screen_name
      };

      callback(null);
    }

  ], function(err) {
    if (err) {
      return next(err);
    }

    res.redirect('/app');
  });
};

exports.logout = function(req, res, next) {
  req.session.destroy(function(err) {
    if (err) {
      return next(err);
    }

    res.redirect('/');
  });
};


exports.app = function(req, res, next) {
  res.render('app', {
    title: 'weibo-oauth2 测试'
  });
};


exports.api = function(req, res, next) {
  var body = req.body
    , params = {};

  for (key in body) {
    if (key != 'type' && key != 'path') {
      params[key] = body[key];
    }
  }

  oauth2.request({
    method: body.type,
    path: body.path
  }, params, req.session.access_token, function(err, ret) {
    if (err) {
      res.send(err.data, err.statusCode);
    } else {
      res.send(ret);
    }
  });
};