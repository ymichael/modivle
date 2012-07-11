({
	baseUrl: "../",
	name: "libs/almond",
	wrap: true,
	include: "mobile_main",
	out: "../../../build/js/mobile_main.js",
	paths: {
		'jquery': "libs/zeptowrapper",
		'underscore': "libs/underscore",
		'backbone': "libs/backbone",
		'ivle': "libs/ivle",
		'mobile_app' : "scripts/mobile_app",
		'mobile_views' : "scripts/mobile_views",
		'mobile_ich' : "templates/mobile",
		'models' : "scripts/models"
	}
})