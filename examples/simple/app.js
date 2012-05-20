
/**
 * Module dependencies.
 */

var express = require('express')
  , config = require('./config')
  , routes = require('./routes');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.cookieParser());
  app.use(express.session({
    secret: 'top secret'
  }));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.set('showStack', true);
  app.set('dumpExceptions', true);
});

app.configure('production', function(){
  app.set('showStack', false);
  app.set('dumpExceptions', false);
});

app.dynamicHelpers({
  session: function(req, res){
    return req.session;
  },

  user: function(req, res) {
    return req.session.user;
  }
});

app.error(express.errorHandler({
  dumpExceptions: app.set('dumpExceptions'),
  showStack: app.set('showStack')
}));

// Routes

app.get('/', routes.index);

app.get('/login', routes.login);
app.get('/logout', routes.logout);
app.get('/callback', routes.callback);

app.get('/app', routes.authorize, routes.app);
app.post('/api', routes.authorize, routes.api);


app.listen(config.server.port, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});