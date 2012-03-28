require.config({
	paths: {
		'jquery': "http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min",
		'underscore': "libs/underscore-min",
		'backbone': "libs/backbone-min",
		'ich': "libs/icanhazamd.min",
		'ivle': "libs/ivle",

		'mainapp' : "scripts/app",
		'appmodels': "scripts/models",
		'appviews': "scripts/views"
	}
});
require(['mainapp'], 
function(app){
	var x = new app();
	x.init();
});