({
	baseUrl: "../",
	name: "libs/almond",
	wrap: true,
	include: "landing_main",
	out: "../../../build/js/landing_main.js",
	paths: {
		// 'jquery': "empty:",
		// 'jquery': "libs/jquery-1.7.2",
		'jquery': "libs/zeptowrapper",
		'underscore': "libs/underscore",
		'backbone': "libs/backbone",
		'ich': "libs/icanhazamd",
		'ivle': "libs/ivle",
		'landing': "scripts/landing_page"
	}
})