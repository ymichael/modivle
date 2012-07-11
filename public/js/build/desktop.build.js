({
	baseUrl: "../",
	name: "libs/almond",
	wrap: true,
	include: "desktop_main",
	out: "../../../build/js/desktop_main.js",
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
})