/*global require:true */
require.config({
	paths: {
		// 'jquery': "libs/jquery-1.7.2",
		'jquery': "libs/zeptowrapper",
		'underscore': "libs/underscore",
		'backbone': "libs/backbone",
		'ich': "libs/icanhazamd",
		'ivle': "libs/ivle",
		'app' : "scripts/desktop_app",
		'views' : "scripts/desktop_views",
		'models' : "scripts/models"
	}
});
require(['app'],
function(app){
	var x = new app();
	x.start();
});