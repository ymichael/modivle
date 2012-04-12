var express = require('express')
  , routes = require('./routes')
  , _ = require('underscore')
  , redisstore = require('connect-redis')(express); // redis sessions



var app = module.exports = express.createServer();

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  
  // redis session store.
  var sessionstore = new redisstore;
  app.use(express.session({ 
    secret: "5{6?8j6^@%$R^Q+", 
    store: sessionstore,
    cookie: 
      {maxAge: 1000*60*60*24*14}
    }));
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.use(express.static(__dirname + '/public'));
});
app.configure('production', function(){
  app.use(express.errorHandler());
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
      routes.mobile.login(req, res);
    } else {
      routes.desktop.login(req, res);
    }
});
app.get('/welcome', function(req, res){
    if (ismobile(req)){
      routes.mobile.welcome(req, res);
    } else {
      routes.desktop.welcome(req, res);
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
app.listen(port, function() {
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

