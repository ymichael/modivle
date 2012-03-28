require.config({
	paths: {
		'jquery': "http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min",
		'underscore': "libs/underscore",
		'backbone': "libs/backbone",
		'ich': "libs/icanhazamd",
		'ivle': "libs/ivle",
		'mainapp' : "scripts/app"
	}
});
require(['mainapp'], 
function(app){
	var x = new app();
	x.init();
});