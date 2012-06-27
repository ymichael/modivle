({
	baseUrl: "../",
	name: "libs/almond",
	wrap: true,
	include: "desktop_main",
	out: "../../../build/js/desktop_main.js",
	paths: {
		// 'jquery': "empty:",
		'jquery': "libs/jquery-1.7.2",
		'underscore': "libs/underscore",
		'backbone': "libs/backbone",
		'ich': "libs/icanhazamd",
		'ivle': "libs/ivle",
		'app' : "scripts/desktop_app",
		'views' : "scripts/desktop_views",
		'models' : "scripts/models"
	}
})