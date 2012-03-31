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
  app.use(express.session({ secret: "5{6?8j6^@%$R^Q+", store: sessionstore, maxAge: 1209600 }));
  
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
  if (!req.session.bootstrap){
    req.session.bootstrap = {};
  }
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
  //regenerate new session
  req.session.regenerate(function(err){
    //tmp measure. todo.
    if (err) {
      res.redirect('/');
    } else {
      //add token to session variable
      if (!req.session.bootstrap) req.session.bootstrap = {};
      var token = req.query.token;
      req.session.bootstrap.token = token;
      res.redirect('/', 302);
    }
  });
});

app.post('/modules', function(req,res){
  if (!req.session.bootstrap || !req.session.bootstrap.token){
    res.redirect('/', 302);
  } else {
    var modules = req.body.modules;
    req.session.bootstrap.modules = modules;
    res.json({updatestatus: "Success"});
  }
});

app.post('/workbin', function(req,res){
  if (!req.session.bootstrap || !req.session.bootstrap.token || !req.session.bootstrap.modules){
    res.redirect('/', 302);
  } else {
    _.each(req.session.bootstrap.modules, function(module){
      if (module.ID == req.body.moduleid){
        module.workbin = req.body.workbin;
      }
    });
    res.json({updatestatus: "Success"});
  }
});


app.get('/logout', function(req,res){
  req.session.destroy(function(err){
    res.redirect('/', 302);
  });
});

app.get('/proxy', routes.proxy);

var port = process.env.PORT || 9002;
app.listen(port, function() {
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

