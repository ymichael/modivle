define([
	  'jquery'
	, 'underscore'
	, 'backbone'
	, 'ich'
	, 'ivle'
	// , 'appmodels'
	// , 'appviews'
	, 'text!templates/template.html'
], 
function($,_,Backbone,ich,ivle,templates){
$('body').append(templates);
ich.grabTemplates();

var ModIvle = Backbone.View.extend({
	initialize: function(){
		var apikey = "ba1ge5NQ9cl76KQNI1Suc";
		this.ivle = new ivle(apikey);
	},
	init: function(){
		console.log(bootstrap);
	},
	events: {

	},
	render: function(){

	}
});


return ModIvle;
});
