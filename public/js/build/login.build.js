({
	baseUrl: "../",
	name: "libs/almond",
	wrap: true,
	include: "login",
	out: "../../../build/js/login.js",
	paths: {
		// 'jquery': "empty:",
		'jquery': "libs/jquery-1.7.2",
		'underscore': "libs/underscore",
		'backbone': "libs/backbone",
		'ich': "libs/icanhazamd",
		'ivle': "libs/ivle",
		'mainapp' : "scripts/app",
		'appmodels' : "scripts/models",
		'appviews' : "scripts/views",
		'loginscript' : "scripts/login"
	}
})