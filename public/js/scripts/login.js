/*global define:true */
define(['jquery','ivle'], 
function($,ivle){

var login = {};
login.apikey = "ba1ge5NQ9cl76KQNI1Suc";
login.ivle = new ivle(login.apikey, '/proxy/');

login.init = function(){
	var re = new RegExp("^(.+" + window.location.host+ ")");
	var callbackurl =  re.exec(window.location.href)[1] + "/ivle/auth";
	login.ivle.auth($('#login'), callbackurl);
};

return login;
});
