/*global $:true */
var slowscroll = function(yaxis){
	var current = window.scrollY;
	if (current !== yaxis) {
		var delta = yaxis - current;
		
		var speed = 30;
		var scrollby;
		if (delta > 0) {
			scrollby = speed < delta ? speed : delta;
		} else {
			scrollby = -speed > delta ? -speed : delta;
		}
		window.scrollBy(0, scrollby);
		setTimeout(function(){
			slowscroll(yaxis);
		}, 2);
	}
};
$(function(){
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
	$("#features").on("click", function(){ slowscroll(500); });
	$("#home, #logo").on("click", function(){ slowscroll(0); });
	$("#login").on("click", function(){
		var apikey = "ba1ge5NQ9cl76KQNI1Suc";
		var re = new RegExp("^(.+" + window.location.host+ ")");
		var callbackurl =  re.exec(window.location.href)[1] + "/ivle/auth";
		var authUrl = "https://ivle.nus.edu.sg/api/login/?apikey=" + apikey + "&url=" + encodeURIComponent(callbackurl);
		window.location.href = authUrl;
	});


	//intialize state;
	var state = {};
	state.view = null;

	//show banner.
	$("#one").addClass("enter");
	scrollspy();
});