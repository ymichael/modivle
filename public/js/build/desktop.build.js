({
	baseUrl: "../",
	name: "libs/almond",
	wrap: true,
	include: "desktop_main",
	out: "../../../build/js/desktop_main.js",
	paths: {
		// 'jquery': "libs/jquery-1.7.2",
		'jquery': "libs/zeptowrapper",
		'underscore': "libs/underscore",
		'backbone': "libs/backbone",
		'ich': "libs/icanhazamd",
		// 'keymaster' : "libs/keymasterwrapper",
		'keyboardjs' : "libs/keyboard",
		'ivle': "libs/ivle",
		'app' : "scripts/desktop_app",
		'views' : "scripts/desktop_views",
		'models' : "scripts/models"
	}
})