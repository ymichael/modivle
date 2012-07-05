/*global require:true */
require.config({
	paths: {
		// 'jquery': "http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min",
		// 'jquery': "libs/jquery-1.7.2",
		'jquery': "libs/zeptowrapper",
		'underscore': "libs/underscore",
		'backbone': "libs/backbone",
		'ich': "libs/icanhazamd",
		'ivle': "libs/ivle",
		'landing': "scripts/landing_page"
	}
});
require(['landing'],
function(Landingpage){
	var x = new Landingpage();
	x.start();
});