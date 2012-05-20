var querystring = require('querystring')
  , stringify = querystring.stringify;

function isEmptyObject(obj) {
  var key;

  for ( key in obj ) {
    return false;
  }

  return true;
}

function addUrlParam(url, key, value) {
  if (typeof key == 'object') {
    var obj = key;
    if (!isEmptyObject(obj)) {
      return url + '?' + stringify(obj);
    }
  } else {
    var sep = (url.indexOf('?') >= 0) ? "&" : "?";
    return url + sep + toRfc3986(key) + "=" +
      toRfc3986(value);
  }

  return url;
}

function toRfc3986(val) {
  return encodeURIComponent(val).replace(/\!/g, "%21").replace(/\*/g, "%2A")
    .replace(/'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29");
}

function extend(target, obj) {
  var objs = Array.prototype.slice.call(arguments, 1);

  objs.forEach(function(obj, i) {
    if (obj && obj instanceof Object) {
      var attr;
      for (attr in obj) {
        if (obj.hasOwnProperty(attr)) {
          target[attr] = obj[attr];
        }
      }
    }
  });

  return target;
}


exports.stringify = stringify;
exports.addUrlParam = addUrlParam;

exports.isEmptyObject = isEmptyObject;
exports.extend = extend;