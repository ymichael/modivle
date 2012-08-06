/*global $:true */
$(function(){
	// EVENT HANDLERS
	$("#login").on("click", function(){
		var apikey = "ba1ge5NQ9cl76KQNI1Suc";
		var re = new RegExp("^(.+" + window.location.host+ ")");
		var callbackurl =  re.exec(window.location.href)[1] + "/ivle/auth";
		var authUrl = "https://ivle.nus.edu.sg/api/login/?apikey=" + apikey + "&url=" + encodeURIComponent(callbackurl);
		window.location.href = authUrl;
	});

	//preview
	$("#preview").on("click", function(){
		window.location.href = "/preview";
	});

	//show banner.
	$("#one").addClass("enter");
});