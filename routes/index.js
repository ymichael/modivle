var request = require('request'),
	_ = require('underscore');

//GENERAL ROUTES
exports.proxy = function(req,res){
  	var proxyreq = req.query.request;
  	request(proxyreq, function (error, response, body) {
  		  if (!error && response.statusCode == 200) {
  			res.json(body);
  		  } else {
  		  	res.json({error: error});
  		  }
  	});
}
exports.auth = function(req,res){  
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
      res.redirect(302, '/');
    }
  });
}
exports.token = function(req,res){
  if (!req.session.bootstrap || !req.session.bootstrap.token){
    res.redirect(302, '/');
  } else {
    var newtoken = req.body.token;
    var date = req.body.date;
    //session is not updating occasionally
    req.session.bootstrap.token = newtoken;
    req.session.bootstrap.date = date;
    res.json({updatestatus: "Success"});
  }
}
exports.modules = function(req,res){
  if (!req.session.bootstrap || !req.session.bootstrap.token){
    res.redirect(302, '/');
  } else {
    var modules = req.body.modules;
    //session is not updating occasionally
    req.session.bootstrap.update = "1";
    req.session.bootstrap.modules = modules;
    res.json({updatestatus: "Success"});
  }
}
exports.workbin = function(req,res){
  if (!req.session.bootstrap || !req.session.bootstrap.token || !req.session.bootstrap.modules){
    res.redirect(302, '/');
  } else {
    _.each(req.session.bootstrap.modules, function(module){
      if (module.ID == req.body.moduleid){
        module.workbin = req.body.workbin;
      }
    });
    res.json({updatestatus: "Success"});
  }
}
exports.logout = function(req,res){
  req.session.destroy(function(err){
    res.redirect(302, '/');
  });
}

//DESKTOP
exports.desktop = {};
exports.desktop.landing = function(req, res){
  if (!req.session.bootstrap || !req.session.bootstrap.token){
    var variables = {};
    variables.env = process.env.NODE_ENV ? "prod" : "dev";
    res.render('landing', variables);
  } else {
    res.redirect(302, '/welcome');
  }
}
exports.desktop.main = function(req,res){
  if (!req.session.bootstrap || !req.session.bootstrap.token){
    //not logged in
    res.redirect(302, '/');
  } else {
    if (!req.session.bootstrap){
      req.session.bootstrap = {};
    }
    var variables = {};
    variables.bootstrap = req.session.bootstrap;
    variables.env = process.env.NODE_ENV ? "prod" : "dev";
    res.render('main', variables)
  }
}

//MOBILE
exports.mobile = {};
exports.mobile.landing = function(req, res){
  if (!req.session.bootstrap || !req.session.bootstrap.token){
    var variables = {};
    variables.env = process.env.NODE_ENV ? "prod" : "dev";
    res.render('mobile/landing', variables);
  } else {
    res.redirect(302, '/welcome');
  }
}
exports.mobile.main = function(req,res){
  if (!req.session.bootstrap || !req.session.bootstrap.token){
    //not logged in
    res.redirect(302, '/');
  } else {
    if (!req.session.bootstrap){
      req.session.bootstrap = {};
    }
    var variables = {};
    variables.bootstrap = req.session.bootstrap;
    variables.env = process.env.NODE_ENV ? "prod" : "dev";
    res.render('mobile/main', variables)
  }
}