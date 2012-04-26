all:
	#optimise js files
	r.js -o public/js/build/app.build.js
	r.js -o public/js/build/login.build.js
	r.js -o public/js/build/mobile.build.js
	
	#concatenate less files
	cat public/css/normalize.css public/css/main.less > public/css/tmp/combinemain.less
	cat public/css/normalize.css public/css/landing.less > public/css/tmp/combinewelcome.less
	cat public/css/normalize.css public/css/mobilelanding.less > public/css/tmp/mobilecombinelanding.less
	cat public/css/normalize.css public/css/mobilemain.less > public/css/tmp/mobilecombinemain.less
	
	#parse and minify less files
	lessc public/css/tmp/combinemain.less > build/css/main.css --yui-compress
	lessc public/css/tmp/combinewelcome.less > build/css/landing.css --yui-compress
	lessc public/css/tmp/mobilecombinemain.less > build/css/mobilemain.css --yui-compress
	lessc public/css/tmp/mobilecombinelanding.less > build/css/mobilelanding.css --yui-compress

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
	jshint public/js/mobile/
	
	#main files
	jshint public/js/login.js
	jshint public/js/main.js
	jshint public/js/mobilemain.js