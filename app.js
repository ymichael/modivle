var express = require('express')
  , routes = require('./routes')
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
  app.use(express.session({ secret: "5{6?8j6^@%$R^Q+", store: sessionstore }));
  
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.use(express.static(__dirname + '/public'));
});
app.configure('production', function(){
  app.use(express.errorHandler());
  app.use(express.static(__dirname + '/build', { maxAge: 86400000 }));
});

// Routes
app.get('/', function(req,res){
  var variables = {};
  variables.title = "modIVLE";
  if (!req.session.bootstrap) req.session.bootstrap = {};
  variables.bootstrap = req.session.bootstrap;
  
  var production = process.env.NODE_ENV;
  // $ NODE_ENV=production node app.js
  if (production){
  	variables.layout = "layoutprod";
  } else {
  	variables.layout = "layoutdev";  
  }
  res.render('index', variables)
});

app.get('/ivle/auth', function(req,res){
  var token = req.query.token;
  //add token to session variable
  if (!req.session.bootstrap) req.session.bootstrap = {};
  req.session.bootstrap.token = token;
  console.log('adsf');
  res.redirect('/', 301);
});

app.get('/logout', function(req,res){
  req.session.destroy(function(err){
    res.redirect('/', 301);  
  });
});

var port = process.env.PORT || 9002;
app.listen(port, function() {
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

