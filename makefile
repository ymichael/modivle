all:
	#optimise js files
	r.js -o public/js/app.build.js
	r.js -o public/js/login.build.js
	cat public/css/normalize.css public/css/main.less > public/css/combine.less
	cat public/css/normalize.css public/css/login.less > public/css/combinelogin.less
	lessc public/css/combine.less > build/css/main.css --yui-compress
	lessc public/css/combinelogin.less > build/css/login.css --yui-compress
	cp -R public/img build/

clean:
	rm public/css/combine.less
	rm build/js/main.js
	rm build/css/main.css
	rm build/css/login.css
	rm -R build/img