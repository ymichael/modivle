/*global require:true */
require.config({
	paths: {
		'jquery': "libs/zeptowrapper",
		'underscore': "libs/underscore",
		'backbone': "libs/backbone",
		'ivle': "libs/ivle",
		'mobile_app' : "scripts/mobile_app",
		'mobile_views' : "scripts/mobile_views",
		'mobile_ich' : "templates/mobile",
		'models' : "scripts/models"
	}
});
require(['mobile_app'],
function(app){
	var x = new app();
	x.start();
});