var $ = require('jquery');
var config = require('./config.js')

$(function(){
  $("#login").on("click", function(){
    var re = new RegExp("^(.+" + window.location.host+ ")");
    var callbackurl =  re.exec(window.location.href)[1] + "/";
    var authUrl = "https://ivle.nus.edu.sg/api/login/?apikey=" + config.API_KEY + "&url=" + encodeURIComponent(callbackurl);
    window.location.href = authUrl;
  });

  var activetab = function(view){
    $(".active").removeClass("active");
    if (view === "home"){
      $("#home").addClass("active");
      $("#tabarrow")
        .removeClass()
        .addClass("home");
    } else if (view === "features") {
      $("#features").addClass("active");
      $("#tabarrow")
        .removeClass()
        .addClass("features");
    }
  };
  var scrollspy = function(e){
    var current = window.scrollY;
    var active = current < 490 ? "home" : "features";

    if (active !== state.view) {
      activetab(active);
      state.view = active;
    }
  };
  // EVENT HANDLERS
  $(window).on("scroll", scrollspy);
  var state = {};
  state.view = null;
  //show banner.
  $("#one").addClass("enter");
  scrollspy();
});