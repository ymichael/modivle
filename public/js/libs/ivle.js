define([
	  'jquery'
	, 'underscore'
],function($, _){
//main library obj
var ivle = (function($){
	//private stuff.
	var baseurl = "https://ivle.nus.edu.sg/api/Lapi.svc/";

	var jsonp = function(url, params, success, error){
		$.ajax({
			type: 'GET',
			dataType: 'jsonp',
			data: params,
			url: url,
			success: success,
			error: error
		});
	}
	//public
	var ivle = function(apikey){
		var apikey = apikey;
		
		this.auth = function($el, callbackurl){
			$el.click(function(){
				var authUrl = "https://ivle.nus.edu.sg/api/login/?apikey=" + apikey + "&url=" + encodeURIComponent(callbackurl);
				window.location.href = authUrl;
			});
		};

		//create user with auth token
		this.user = function(authtoken){
			this.authtoken = authtoken;
			/*
			 * 	APICALLS (work in progress)
			 */

			//modules
			this.modules = function(success, error){
				var endpoint = 'Modules';
				var params = {
					"APIKey" : apikey,
					"AuthToken" : this.authtoken,
					"Duration" : 0,
					//whether to display basic info or all or it.
					"IncludeAllInfo" : true,
					//"IncludeAllInfo" : false,

					"output" : "json"
				};
				var url = baseurl + endpoint;
				jsonp(url, params, success, error);
			}

			//workbin
			this.workbin = function(courseId, success, error){
				var endpoint = 'Workbins';
				var params = {
					"APIKey" : apikey,
					"AuthToken" : this.authtoken,
					"CourseId" : courseId,
					"Duration" : 0,
					
					//"WorkbinID" : 0, // undefined means all
					
					//whether to display basic info or all or it.
					// "TitleOnly" : true,
					"TitleOnly" : false,
					"output" : "json"
				};
				var url = baseurl + endpoint;
				jsonp(url, params, success, error);
			}

			//file download
			this.file = function(fileId){
				//dont like this. but it works
				var url = "https://ivle.nus.edu.sg/api/downloadfile.ashx?APIKey=" + apikey + "&AuthToken=" + this.authtoken + "&ID=" + fileId + "&target=workbin";
				window.location.href = url;
			}
		}
	}
	return ivle;
})($);

return ivle;
});
