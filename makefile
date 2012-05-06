all:
	#optimise js files
	r.js -o public/js/build/desktop.build.js
	r.js -o public/js/build/mobile.build.js

	r.js -o public/js/build/login.build.js
	
	#concatenate less files
	cat public/css/normalize.css public/css/desktop_app.less > public/css/tmp/desktop_app.less
	cat public/css/normalize.css public/css/desktop_landing.less > public/css/tmp/desktop_landing.less
	cat public/css/normalize.css public/css/mobile_app.less > public/css/tmp/mobile_app.less
	cat public/css/normalize.css public/css/mobile_landing.less > public/css/tmp/mobile_landing.less
	
	#parse and minify less files
	lessc public/css/tmp/desktop_app.less > build/css/desktop_app.css --yui-compress
	lessc public/css/tmp/desktop_landing.less > build/css/desktop_landing.css --yui-compress
	lessc public/css/tmp/mobile_app.less > build/css/mobile_app.css --yui-compress
	lessc public/css/tmp/mobile_landing.less > build/css/mobile_landing.css --yui-compress

	#copy images into build folder
	cp -R public/img build/
	cp public/favicon.ico build/favicon.ico

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

test:
	#copy latest js files into test folder.
	cp -R public/js tests/

jshint:
	#scripts
	jshint public/js/scripts/
	
	#main files
	jshint public/js/login.js
	jshint public/js/desktop_main.js
	jshint public/js/mobile_main.js