all:
	#optimise js files
	r.js -o public/js/build/app.build.js
	r.js -o public/js/build/login.build.js
	r.js -o public/js/build/mobile.build.js
	
	#concatenate less files
	cat public/css/normalize.css public/css/main.less > public/css/combine.less
	cat public/css/normalize.css public/css/login.less > public/css/combinelogin.less
	cat public/css/normalize.css public/css/mobilelogin.less > public/css/mobilelogincombine.less
	cat public/css/normalize.css public/css/mobile.less > public/css/mobilecombine.less
	
	#parse and minify less files
	lessc public/css/combine.less > build/css/main.css --yui-compress
	lessc public/css/combinelogin.less > build/css/login.css --yui-compress
	lessc public/css/mobilecombine.less > build/css/mobile.css --yui-compress
	lessc public/css/mobilelogincombine.less > build/css/mobilelogin.css --yui-compress

	#copy images into build folder
	cp -R public/img build/

clean:
	#remove concatenated less files
	rm public/css/combine.less
	rm public/css/combinelogin.less
	rm public/css/mobilelogincombine.less
	rm public/css/mobilecombine.less
	
	#remove minified js files
	rm build/js/main.js
	rm build/js/login.js
	rm build/js/mobilemain.js
	
	#remove minified css files
	rm build/css/main.css
	rm build/css/login.css
	rm build/css/mobilelogin.css
	rm build/css/mobile.css

	#remove images in build folder.
	rm -R build/img

test:
	#copy latest js files into test folder.
	cp -R public/js tests/

jshint:
	jshint public/js/scripts
	jshint public/js/mobile