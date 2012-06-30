/*global require:true */
require.config({
	paths: {
		// 'jquery': "http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min",
		// 'jquery': "libs/jquery-1.7.2",
		'jquery': "libs/zeptowrapper",
		'underscore': "libs/underscore",
		'backbone': "libs/backbone",
		'ich': "libs/icanhazamd",
		'ivle': "libs/ivle",
		'mainapp' : "scripts/app",
		'appmodels' : "scripts/models",
		'appviews' : "scripts/views",
		'loginscript' : "scripts/login"
	}
});
require(['loginscript'],
function(login){
	login.init();
});