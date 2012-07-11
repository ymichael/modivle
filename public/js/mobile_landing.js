/*global $:true */
$(function(){
	$("#login").on("tap", function(){
		var apikey = "ba1ge5NQ9cl76KQNI1Suc";
		var re = new RegExp("^(.+" + window.location.host+ ")");
		var callbackurl =  re.exec(window.location.href)[1] + "/ivle/auth";
		var authUrl = "https://ivle.nus.edu.sg/api/login/?apikey=" + apikey + "&url=" + encodeURIComponent(callbackurl);
		window.location.href = authUrl;
	});

	//preview
	$("#preview").on("tap", function(){
		window.location.href = "/preview";
	});
});