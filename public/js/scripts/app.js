define([
	  'jquery'
	, 'underscore'
	, 'backbone'
	, 'ich'
	, 'ivle'
	, 'appmodels'
	, 'appviews'
	, 'text!templates/template.html'
], 
function($,_,Backbone,ich,ivle,m,v,templates){
$('body').append(templates);
ich.grabTemplates();

var ModIvle = Backbone.View.extend({
	el: "#container",
	initialize: function(){
		var apikey = "ba1ge5NQ9cl76KQNI1Suc";
		this.ivle = new ivle(apikey);

		_.bindAll(this, 'init');
	},
	init: function(){
		this.bootstrap = bootstrap;
		if (this.bootstrap.token){
			//authenticated
			this.usertoken = this.bootstrap.token;
			this.user = new this.ivle.user(this.usertoken);
			
			this.loading();
			//user modules
			var that = this;
			this.modules = new m.Modules([],{user: this.user});
			this.modules.fetch(function(){
				that.stoploading();
			});
			
			this.render();
		} else {
			//not authenticated
			this.renderlogin();
		}
	},
	loading: function(){
		$('#overlay').show();
		var that = this;
		$('#close').click(function(){
			that.stoploading();
		});
	},
	stoploading: function(){
		$('#overlay').hide();
	},
	render: function(){
		//header
		this.$('#header_container').html(ich.headeruser());

		this.mainview = new v.MainView({
			user: this.user,
			modules: this.modules
		});
		this.mainview.render();
	},
	renderlogin: function(){
		var re = new RegExp("^(.+" + window.location.host+ ")");
		var callbackurl =  re.exec(window.location.href)[1] + "/ivle/auth";

		this.$('#header_container').html(ich.login());
		this.ivle.auth(this.$('#login'), callbackurl);
	},
	events: {
		'click #logout': "logout",
	},
	logout: function(){
		var re = new RegExp("^(.+" + window.location.host+ ")");
		var logout =  re.exec(window.location.href)[1] + "/logout";
		window.location.href = logout;
	}
});

return ModIvle;
});
