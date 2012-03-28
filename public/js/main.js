require.config({
	paths: {
		'jquery': "libs/jquery-1.7.1",
		'underscore': "libs/underscore",
		'backbone': "libs/backbone",
		'ich': "libs/icanhazamd",

		'mainapp' : "scripts/app",
		'appmodels': "scripts/models",
		'appviews': "scripts/views"
	}
});
require(['mainapp'], 
function(app){
	$(function(){
		setTimeout(function() { window.scrollTo(0, 1) }, 100);
	});

	var loadmap = function(){
		var googlemaps = $("<script type='text/javascript' src='http://maps.googleapis.com/maps/api/js?key=AIzaSyBqqSM8IWCEe1QsLf3w_11H5Mi4ZWWrDPo&sensor=true&callback=initialize'></script>");
		$("body").append(googlemaps);
	}

	var a = new app();
	window.initialize = a.init;
	loadmap();
});