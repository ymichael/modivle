var express = require('express')
  , routes = require('./routes');

var app = module.exports = express.createServer();

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'asdfasdfasdf' }));
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.use(express.static(__dirname + '/public'));
});
app.configure('production', function(){
  app.use(express.errorHandler());
  app.set('views', __dirname + '/viewsproduction');
  app.use(express.static(__dirname + '/build', { maxAge: 86400000 }));
});

// Routes
app.get('/', function(req,res){
  var variables = {};
  variables.title = "modIVLE";
  if (!req.session.bootstrap) req.session.bootstrap = {};
  variables.bootstrap = req.session.bootstrap;

  res.render('index', variables)
});

app.get('/ivle/auth', function(req,res){
  var token = req.query.token;
  
  //add token to session variable
  if (!req.session.bootstrap) req.session.bootstrap = {};
  req.session.bootstrap.token = token;
  res.redirect('/', 301);
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

