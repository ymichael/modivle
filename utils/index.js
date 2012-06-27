//MOBILE DETECTION
var ismobile = function(req){
  var ua = req.header('user-agent');
  var mobile = /mobile/i.test(ua);
  var ipad = /ipad/i.test(ua);
  return !ipad && mobile;
};

//Basic Views Variables
var bootstrap = function(req){
	var x = {};
	x.env = process.env.NODE_ENV === "production" ? "prod" : "dev";
	x.useragent = ismobile(req) ? "mobile" : "desktop";
	x.title = "MODIVLE";
	return x;
};

exports.bootstrap = bootstrap;