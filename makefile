all:
	#optimise js files
	r.js -o public/js/build/app.build.js
	r.js -o public/js/build/login.build.js
	r.js -o public/js/build/mobile.build.js
	
	cat public/css/normalize.css public/css/main.less > public/css/combine.less
	cat public/css/normalize.css public/css/login.less > public/css/combinelogin.less
	cat public/css/normalize.css public/css/mobilelogin.less > public/css/mobilelogincombine.less
	cat public/css/normalize.css public/css/mobile.less > public/css/mobilecombine.less
	
	lessc public/css/combine.less > build/css/main.css --yui-compress
	lessc public/css/combinelogin.less > build/css/login.css --yui-compress
	lessc public/css/mobilecombine.less > build/css/mobile.css --yui-compress
	lessc public/css/mobilelogincombine.less > build/css/mobilelogin.css --yui-compress

	cp -R public/img build/

clean:
	rm public/css/combine.less
	rm public/css/combinelogin.less
	rm public/css/mobilelogincombine.less
	rm public/css/mobilecombine.less
	
	rm build/js/main.js
	rm build/js/login.js
	rm build/js/mobilemain.js
	
	rm build/css/main.css
	rm build/css/login.css
	rm build/css/mobilelogin.css
	rm build/css/mobile.css

	rm -R build/img

tests:
	#client side js tests
	r.js -o public/js/tests/