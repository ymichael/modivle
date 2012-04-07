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
	describe("m.File", function(){
		
		var file = new m.File();
		it("Calculates filesize correctly", function(){
			expect(file.calcfilesize(100)).toEqual("100 bytes");
			expect(file.calcfilesize(1234)).toEqual("1.21 KB");
			expect(file.calcfilesize(1323123)).toEqual("1.26 MB");
		});
		//clean up
		delete file;
	});
});