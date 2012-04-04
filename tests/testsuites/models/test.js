require.config({
	paths: {
		'jquery': "http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min",
		//'jquery': "libs/jquery-1.7.2",
		'underscore': "../../js/libs/underscore",
		'backbone': "../../js/libs/backbone",
		'ich': "../../js/libs/icanhazamd",
		'ivle': "../../js/libs/ivle",
		'mainapp' : "../../js/scripts/app",
		'appmodels' : "../../js/scripts/models",
		'appviews' : "../../js/scripts/views",
	}
});
require(["appmodels"], 
function(m){
	//jasmine test.
	describe("Client-Side Backbone Models Test Suite", function(){
		it("Gets required modules correctly", function(){
			expect(true == true);
		});


	});
});