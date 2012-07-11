/*global require:true describe it expect*/
require.config({
	baseUrl: "../public/js",
	paths: {
		'jquery': "libs/zeptowrapper",
		'underscore': "libs/underscore",
		'backbone': "libs/backbone",
		// 'keymaster' : "libs/keymasterwrapper",
		'keyboardjs' : "libs/keyboard",
		'ivle': "libs/ivle",
		'desktop_app' : "scripts/desktop_app",
		'desktop_views' : "scripts/desktop_views",
		'desktop_ich' : "templates/desktop",
		'mobile_app' : "scripts/mobile_app",
		'mobile_views' : "scripts/mobile_views",
		'mobile_ich' : "templates/mobile",
		'models' : "scripts/models"
	}
});
require(["models", "desktop_views", "desktop_ich", "mobile_views", "mobile_ich"],
function(m, desktop_view, desktop_ich, mobile_view, mobile_ich){
	describe("App Models", function(){
		describe("m.File", function(){
			var file = new m.File();
			it("Calculates filesize correctly", function(){
				expect(file.calcfilesize(100)).toEqual("100 bytes");
				expect(file.calcfilesize(1234)).toEqual("1.21 KB");
				expect(file.calcfilesize(1323123)).toEqual("1.26 MB");
			});
		});
	});

	describe("Underscore templates", function(){
		describe("Desktop", function(){
			it('module template', function(){
				try {
					var module = new m.Module({}, {user: {}});
					var x = desktop_ich.moduleview(module.toJSON());
				} catch (e) {
					expect(e).toBeUndefined();
				}
			});
		});
		describe("Mobile", function(){
			it('module template', function(){
				try {
					var module = new m.Module({}, {user: {}});
					var x = mobile_ich.moduleview(module.toJSON());
				} catch (e) {
					expect(e).toBeUndefined();
				}
			});
		});
	});
});