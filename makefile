all:
	#optimise js files
	r.js -o public/js/app.build.js
	lessc public/css/main.less > build/css/main.css --yui-compress

clean:
	rm build/js/main.js
	rm build/css/main.css