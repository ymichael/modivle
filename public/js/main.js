require.config({
	paths: {
		'jquery': "libs/jquery-1.7.1.min",
		'underscore': "libs/underscore-min",
		'backbone': "libs/backbone-min",
		'ich': "libs/icanhazamd",
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