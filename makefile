all:
	#optimise js files
	r.js -o public/js/build/desktop.build.js
	r.js -o public/js/build/mobile.build.js
	r.js -o public/js/build/login.build.js
	
	#parse and minify less files
	lessc public/css/desktop_app.less > build/css/desktop_app.css --yui-compress
	lessc public/css/desktop_landing.less > build/css/desktop_landing.css --yui-compress
	lessc public/css/mobile_app.less > build/css/mobile_app.css --yui-compress
	lessc public/css/mobile_landing.less > build/css/mobile_landing.css --yui-compress

clean:
	#remove concatenated less files
	rm -rf public/css/tmp
	mkdir public/css/tmp
	
	#remove minified js files
	rm build/js/main.js
	rm build/js/login.js
	rm build/js/mobilemain.js
	
	#remove minified css files
	rm build/css/main.css
	rm build/css/landing.css
	rm build/css/mobilelanding.css
	rm build/css/mobilemain.css

	#remove images in build folder.
	rm -R build/img
	rm build/favicon.ico

jshint:
	#scripts
	jshint public/js/scripts/
	
	#main files
	jshint public/js/login.js
	jshint public/js/desktop_main.js
	jshint public/js/mobile_main.js

images:
	#copy images into build folder
	cp -R public/img build/
	cp public/favicon.ico build/favicon.ico
	
	#optimise pngs
	optipng build/img/*.png --strip all
	optipng build/img/filetypes/*.png --strip all
	optipng build/img/logo/*.png --strip all
	
	#jpeg
	jpegtran -copy none -outfile build/img/logo/github.jpg -optimize build/img/logo/github.jpg