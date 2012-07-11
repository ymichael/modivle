/*global require:true */
require.config({
	paths: {
		'jquery': "libs/zeptowrapper",
		'underscore': "libs/underscore",
		'backbone': "libs/backbone",
		'keyboardjs' : "libs/keyboard",
		'ivle': "libs/ivle",
		'desktop_app' : "scripts/desktop_app",
		'desktop_views' : "scripts/desktop_views",
		'desktop_ich' : "templates/desktop",
		'models' : "scripts/models"
	}
});
require(['desktop_app'],
function(app){
	var x = new app();
	x.start();
});