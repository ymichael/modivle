/*global define:true */
define([
	'jquery',
	'underscore',
	'backbone',
	'ich',
	'ivle',
	'text!templates/landing.html'
],
function($,_,Backbone,ich,Ivle,templates){
$('body').append(templates);
ich.grabTemplates();

var LandingPage = Backbone.View.extend({
	el: "body",
	initialize: function(){
		var apikey = "ba1ge5NQ9cl76KQNI1Suc";
		this.ivle = new Ivle(apikey, '/proxy/');
	},
	start: function(){
		this.header = new HeaderView();
		this.main = new MainView();
	},
	login: function(){
		var re = new RegExp("^(.+" + window.location.host+ ")");
		var callbackurl =  re.exec(window.location.href)[1] + "/ivle/auth";
		window.location = this.ivle.authurl(callbackurl);
	},
	events: {
		"login" : "login",
		"changeview" : "changeview"
	},
	changeview: function(e, view){
		this.header.active(view);
		this.main.changeview(view);
	}
});

var HeaderView = Backbone.View.extend({
	el: "header",
	initialize: function(){

	},
	events: {
		"click #login" : "login",
		"click #features" : "features",
		"click #about" : "about"
	},
	login: function(){
		this.$el.trigger("login");
	},
	features: function(){
		this.$el.trigger("changeview", "features");
	},
	about: function(){
		this.$el.trigger("changeview", "about");
	},
	active: function(view){
		this.$(".header_link").each(function(index, el){
			var $el = $(el);
			if ($el.html() === view){
				$el.addClass("active");
			} else {
				$el.removeClass("active");
			}
		});
		this.$("#tabarrow")
			.removeClass()
			.addClass(view);
	}
});
var MainView = Backbone.View.extend({
	el: "#main",
	initialize: function(){

	},
	changeview: function(view){
		console.log(view);
	}
});

return LandingPage;
});