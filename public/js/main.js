require.config({
	paths: {
		'jquery': "http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min",
		'underscore': "libs/underscore",
		'backbone': "libs/backbone",
		'ich': "libs/icanhazamd",
		'ivle': "libs/ivle",
		'mainapp' : "scripts/app",
		'appmodels' : "scripts/models",
		'appviews' : "scripts/views",
	}
});
require(['mainapp'], 
function(app){
	var x = new app();
	x.init();
});