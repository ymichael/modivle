all:
	#optimise js files
	r.js -o public/js/app.build.js
	cat public/css/normalize.css public/css/main.less > public/css/combine.less
	lessc public/css/combine.less > build/css/main.css --yui-compress

clean:
	rm public/css/combine.less
	rm build/js/main.js
	rm build/css/main.css