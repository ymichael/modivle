var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , _ = require('underscore')
  , redisstore = require('connect-redis')(express); // redis sessions



var app = module.exports = express();

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon('./public/favicon.ico'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser("5{6?8j6^@%$R^Q+"));
  // redis session store.
  var sessionstore = new redisstore;
  app.use(express.session({
    store: sessionstore,
    cookie: 
      {maxAge: 1000*60*60*24*14}
    }));
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.use(express.logger('dev'));
  app.use(express.static(__dirname + '/public'));
});
app.configure('production', function(){
  app.use(express.errorHandler());
  app.use(express.compress());
  var oneday = 86400000;
  app.use(express.static(__dirname + '/build', { maxAge: oneday*7 }));
});

//Routes
var ismobile = function(req){
  var ua = req.header('user-agent');
  var mobile = /mobile/i.test(ua);
  var ipad = /ipad/i.test(ua);
  return !ipad && mobile
}

app.get('/', function(req, res){
    if (ismobile(req)){
      routes.mobile.landing(req, res);
    } else {
      routes.desktop.landing(req, res);
    }
});
app.get('/welcome', function(req, res){
    if (ismobile(req)){
      routes.mobile.main(req, res);
    } else {
      routes.desktop.main(req, res);
    }
});

//Generic routes
app.get('/ivle/auth', routes.auth);
app.post('/modules', routes.modules);
app.post('/workbin', routes.workbin);
app.get('/logout', routes.logout);
app.get('/proxy', routes.proxy);
app.post('/auth', routes.token);

var port = process.env.PORT || 9002;
http.createServer(app).listen(port, function() {
  console.log("Express server listening on port %d in %s mode", port, app.settings.env);
});

