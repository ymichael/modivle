({
	baseUrl: "../",
	name: "libs/almond",
	wrap: true,
	include: "mobile_main",
	out: "../../../build/js/mobile_main.js",
	paths: {
		// 'jquery': "empty:",
		'jquery': "libs/jquery-1.7.2",
		'underscore': "libs/underscore",
		'backbone': "libs/backbone",
		'ich': "libs/icanhazamd",
		'ivle': "libs/ivle",
		'app' : "scripts/mobile_app",
		'views' : "scripts/mobile_views",
		'models' : "scripts/models"
	}
})