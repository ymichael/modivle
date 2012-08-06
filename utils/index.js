//MOBILE DETECTION
var ismobile = function(req){
  var ua = req.header('user-agent');
  var mobile = /mobile/i.test(ua);
  var ipad = /ipad/i.test(ua);
  return !ipad && mobile;
};

var userdevice = function(req){
  var ua = req.header('user-agent');
  
  //test for mobile.
  var mobile = /mobile/i.test(ua);
  
  //test for tablets. (atm only the ipad)
  var ipad = /ipad/i.test(ua);
  var tablet = ipad;

  if (tablet) {
    return "tablet";
  } else if (mobile) {
    return "mobile";
  } else {
    return "desktop";
  }
};

//Basic Views Variables
var bootstrap = function(req){
	var x = {};
	x.env = process.env.NODE_ENV === "production" ? "prod" : "dev";
	x.useragent = userdevice(req);
	x.title = "MODIVLE";
	return x;
};

exports.bootstrap = bootstrap;