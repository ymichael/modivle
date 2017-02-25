var nicedate = function(date){
  var parts = date.match(/(\d+)/g);
  var dateobj = new Date(parts[0], parts[1]-1, parts[2], parts[3], parts[4], parts[5]);
  return dateobj;
};


var relativeTime = {
  future : "in %s",
  past : "%s ago",
  s : "a few seconds",
  m : "a minute",
  mm : "%d minutes",
  h : "an hour",
  hh : "%d hours",
  d : "a day",
  dd : "%d days",
  M : "a month",
  MM : "%d months",
  y : "a year",
  yy : "%d years"
};

var readabledate = function(dateobj){
  var milliseconds = Date.now() - dateobj.getTime(),
    seconds = Math.round(Math.abs(milliseconds) / 1000),
    minutes = Math.round(seconds / 60),
    hours = Math.round(minutes / 60),
    days = Math.round(hours / 24),
    years = Math.round(days / 365),
    args =  seconds < 45 && "a few seconds" ||
      minutes === 1 && "a minute" ||
      minutes < 45 && minutes + " minutes" ||
      hours === 1 && "an hour" ||
      hours < 22 && hours + " hours" ||
      days === 1 && "a day" ||
      days <= 25 && days + " days" ||
      days <= 45 && "a month" ||
      days < 345 && Math.round(days / 30) + " months" ||
      years === 1 && "a year" || years + " years";
  return args + " ago";
};


var mainPage = "/";
var welcomePage = "/welcome.html";

var isWelcomePage = function() {
  return window.location.pathname == welcomePage;
};

var redirectToMainPage = function() {
  // Redirect to main page.
  var re = new RegExp("^(.+" + window.location.host+ ")");
  window.location.href = re.exec(window.location.href)[1] + mainPage;
};

var redirectToWelcomePage = function() {
  var re = new RegExp("^(.+" + window.location.host+ ")");
  window.location.href = re.exec(window.location.href)[1] + welcomePage;
};


var calcfilesize = function(bytes){
  var unit, index;
  unit = ["bytes", "KB", "MB", "GB"];
  index = 0;
  while (Math.floor(bytes).toString().length > 3){
    index++;
    bytes = parseInt(bytes, 10);
    bytes = bytes / 1024;
  }

  if (Math.round(bytes) !== bytes) {
    bytes = parseFloat(bytes, 10).toFixed(2).toString().slice(0,6);
  }
  return  bytes + " " + unit[index];
};

var supportImage = function(htmlToParse) {
  var regexImg = /(img.*?src=")\/([\w\/.\-\?=:;&]+")/g;
  return htmlToParse.replace(regexImg, '$1https://ivle.nus.edu.sg/$2');
};

module.exports.nicedate = nicedate;
module.exports.readabledate = readabledate;
module.exports.isWelcomePage = isWelcomePage;
module.exports.redirectToWelcomePage = redirectToWelcomePage;
module.exports.redirectToMainPage = redirectToMainPage;
module.exports.calcfilesize = calcfilesize;
module.exports.supportImage = supportImage;