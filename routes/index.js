var request = require('request'),
	_ = require('underscore'),
  utils = require('../utils');

//POST
exports.proxy = function(req,res){
  var proxyreq = req.body.request;
  request(proxyreq, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      res.json(body);
    } else {
      res.json({error: error});
    }
  });
};
exports.auth = function(req,res){
  //regenerate new session
  req.session.regenerate(function(err){
    //tmp measure. todo.
    if (err) {
      res.redirect(403, '/welcome');
    } else {
      //add token to session variable
      if (!req.session.bootstrap) {
        req.session.bootstrap = {};
      }
      var token = req.query.token;
      req.session.bootstrap.token = token;
      res.redirect(302, '/');
    }
  });
};
exports.token = function(req,res){
  if (!req.session.bootstrap || !req.session.bootstrap.token){
    res.redirect(403, '/welcome');
  } else {
    var newtoken = req.body.token;
    var date = req.body.date;
    //session is not updating occasionally
    req.session.bootstrap.token = newtoken;
    req.session.bootstrap.date = date;
    res.json({updatestatus: "Success"});
  }
};
exports.user = function(req,res){
  if (!req.session.bootstrap || !req.session.bootstrap.token){
    res.redirect(403, '/welcome');
  } else {
    req.session.bootstrap.user = {
      uid: req.body.uid,
      email: req.body.email,
      uname: req.body.uname
    };
    res.json({updatestatus: "Success"});
  }
};
exports.modules = function(req,res){
  if (!req.session.bootstrap || !req.session.bootstrap.token){
    res.redirect(403, '/welcome');
  } else {
    var modules = JSON.parse(req.body.modules);

    //add those that dont exist. update those that do.
    req.session.bootstrap.modules = _.map(modules, function(mod){
      var existing = _.find(req.session.bootstrap.modules, function(module){
        return module.id === mod.id;
      });
      if (existing) {
        return _.extend(existing, mod);
      } else {
        return mod;
      }
    });
    res.json({updatestatus: "Success"});
  }
};
exports.forum = function(req,res){
  if (!req.session.bootstrap || !req.session.bootstrap.token || !req.session.bootstrap.modules){
    res.redirect(403, '/welcome');
  } else {
    _.each(req.session.bootstrap.modules, function(module){
      if (module.id === req.body.moduleid){
        if (module.forum) {
          _.extend(module.forum, JSON.parse(req.body.forum));
        } else {
          module.forum = JSON.parse(req.body.forum);
        }
        
      }
    });
    res.json({updatestatus: "Success"});
  }
};
exports.forumheading = function(req,res){
  if (!req.session.bootstrap || !req.session.bootstrap.token || !req.session.bootstrap.modules){
    res.redirect(403, '/welcome');
  } else {
    var found = false;
    _.each(req.session.bootstrap.modules, function(module){
      if (module.id === req.body.moduleid) {
        _.each(module.forum.headings, function(heading) {
          if (heading.id === req.body.headingid) {
            heading.threads = JSON.parse(req.body.threads);
            found = true;
          }
        });
        
        if (!found) {
          _.each(module.forum.forums, function(forum) {
            if (!found) {
              _.each(forum.headings, function(heading) {
                if (heading.id === req.body.headingid) {
                  heading.threads = JSON.parse(req.body.threads);
                  found = true;
                }
              });
            }
          });
        }
      }
    });
    console.log(found);
    res.json({updatestatus: "Success"});
  }
};
exports.workbin = function(req,res){
  if (!req.session.bootstrap || !req.session.bootstrap.token || !req.session.bootstrap.modules){
    res.redirect(403, '/welcome');
  } else {
    _.each(req.session.bootstrap.modules, function(module){
      if (module.id === req.body.moduleid){
        module.workbin = JSON.parse(req.body.workbin);
        // console.log(module.workbin.folders[2]);
      }
    });
    res.json({updatestatus: "Success"});
  }
};


//GET
exports.landing = function(req, res){
  if (!req.session.bootstrap || !req.session.bootstrap.token){
    var variables = utils.bootstrap(req);
    if (variables.useragent === "mobile"){
      res.render('mobile_landing', variables);
    } else {
      res.render('desktop_landing', variables);
    }
  } else {
    res.redirect(302, '/');
  }
};
exports.app = function(req,res){
  if (!req.session.bootstrap || !req.session.bootstrap.token){
    //not logged in
    res.redirect(302, '/welcome');
  } else {
    if (!req.session.bootstrap){
      req.session.bootstrap = {};
    }
    var variables = utils.bootstrap(req);
    variables.bootstrap = req.session.bootstrap;
    
    if (variables.useragent === "mobile"){
      res.render('mobile_app', variables);
    } else {
      res.render('desktop_app', variables);
    }
  }
};
exports.logout = function(req,res){
  req.session.destroy(function(err){
    res.redirect(302, '/welcome');
  });
};