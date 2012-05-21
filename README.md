weibo-oauth2
============

Library for interacting with Weibo API V2 via OAuth 2.

[在线示例](http://nodeweibo.cnodejs.net/)

Installation
------------

via npm:

    npm install weibo-oauth2

Usage
----------

Simple example

    var OAuth2 = require('weibo-oauth2');
    var options = {
      "key": "{{key}}",
      "secret": "{{secret}}",
      "base_uri": "https://api.weibo.com/",
      "redirect_uri": "{{redirect_uri}}",
      "authorize_path": "/oauth2/authorize",
      "access_path": "/oauth2/access_token"
    };
    var oauth2 = new OAuth2(options);

    var app = require('express');

    app.get('/login', function(req, res) {
      var authorizeUrl = oauth2.getAuthorizeUrl();
      res.redirect(authorizeUrl);
    });

    app.get('/callback', function(req, res) {
      var code = req.query.code;
      oauth2.getAccessToken(code, function(err, ret) {
        req.session.maxAge = oauthRet.expires_in * 1000;
        req.session.access_token = oauthRet.access_token;
        res.redirect('/');
      });
    });

具体例子在 `examples/simple`

Public API
----------

### p.getAuthorizeUrl()

获取OAuth2验证地址

### p.getAccessToken(code, callback)

`code`是OAuth2验证后返回的url的query参数

获取Access token

### p.request = function (options, params, accessToken, multi, callback)

不同的参数组合：

1.  options, params, callback
2.  options, callback
3.  options, accessToken, callback
4.  options, params, accessToken, callback
5.  options, params, accessToken, multi, callback

options有以下选项

+   `method`: 默认 `GET`. http method
+   `path`: 微博API路径
+   `host`: 如果使用的API的请求地址的域名不是`api.weibo.com`，比如消息提醒的地址的域名是`rm.api.weibo.com`，使用该参数

params有以下注意的选项

+   `pic`: 要上传图片的路径

上传图片注意设置`params.pic`为图片路径和`multi`为true