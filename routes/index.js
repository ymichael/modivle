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
      res.redirect('/', 302);
    }
  });
}
exports.token = function(req,res){
  if (!req.session.bootstrap || !req.session.bootstrap.token){
    res.redirect('/', 302);
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
    res.redirect('/', 302);
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
    res.redirect('/', 302);
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
    res.redirect('/', 302);
  });
}

//USER AGENT ROUTER
exports.route = function(req, res){

}



//DESKTOP
exports.desktop = {};
exports.desktop.login = function(req, res){
  if (!req.session.bootstrap || !req.session.bootstrap.token){
    var production = process.env.NODE_ENV;
    // $ NODE_ENV=production node app.js
    var variables = {};
    variables.title = "modIVLE";
    if (production){
      variables.layout = "layoutprodlogin";
    } else {
      variables.layout = "layoutdevlogin";  
    }
    res.render('login', variables);
  } else {
    res.redirect('/welcome', 302);
  }
}
exports.desktop.welcome = function(req,res){
  if (!req.session.bootstrap || !req.session.bootstrap.token){
    //not logged in
    res.redirect('/', 302);
  } else {
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
  }
}

//MOBILE
exports.mobile = {};
exports.mobile.login = function(req, res){
  if (!req.session.bootstrap || !req.session.bootstrap.token){
    var production = process.env.NODE_ENV;
    // $ NODE_ENV=production node app.js
    var variables = {};
    variables.title = "modIVLE";
    if (production){
      variables.layout = "mobile/layoutprodlogin";
    } else {
      variables.layout = "mobile/layoutdevlogin";  
    }
    res.render('mobile/login', variables);
  } else {
    res.redirect('/welcome', 302);
  }
}
exports.mobile.welcome = function(req,res){
  if (!req.session.bootstrap || !req.session.bootstrap.token){
    //not logged in
    res.redirect('/', 302);
  } else {
    var variables = {};
    variables.title = "modIVLE";
    if (!req.session.bootstrap){
      req.session.bootstrap = {};
    }
    variables.bootstrap = req.session.bootstrap;
    var production = process.env.NODE_ENV;
    // $ NODE_ENV=production node app.js
    if (production){
      variables.layout = "mobile/layoutprod";
    } else {
      variables.layout = "mobile/layoutdev";  
    }
    res.render('mobile/index', variables)
  }
}