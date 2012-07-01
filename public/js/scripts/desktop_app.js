/*global define:true, bootstrap */
define([
	'jquery',
	'underscore',
	'backbone',
	'ich',
	'ivle',
	'models',
	'views',
	'text!templates/desktop.html'
],
function($,_,Backbone,ich,Ivle,m,v,templates){
$('body').append(templates);
ich.grabTemplates();

var AppRouter = Backbone.Router.extend({
	initialize: function(options){
		this.parent = options.parent;
	},
	routes: {
		":mod/workbin" : "workbin",
		":mod/announcements" : "announcements",
		":mod/forum" : "forum"
	},
	workbin: function(mod){
		this.parent.mainview.modulesview.views[0].moduleselected();
		this.parent.mainview.contentview.contentnav.changeview(null, "workbin");
		this.parent.mainview.contentview.changeview(null, "workbin");
	},
	announcements: function(mod){
		this.parent.mainview.modulesview.views[1].moduleselected();
		this.parent.mainview.contentview.contentnav.changeview(null, "announcements");
		this.parent.mainview.contentview.changeview(null, "announcements");
	},
	forum: function(mod){
		this.parent.mainview.modulesview.views[0].moduleselected();
		this.parent.mainview.contentview.contentnav.changeview(null, "forum");
		this.parent.mainview.contentview.changeview(null, "forum");
	}
});

var App = Backbone.View.extend({
	el: "#container",
	initialize: function(){
		var apikey = "ba1ge5NQ9cl76KQNI1Suc";
		this.ivle = new Ivle(apikey, '/proxy/');
		_.bindAll(this, 'start');
	},
	start: function(){
		this.bootstrap = bootstrap;
		this.usertoken = this.bootstrap.token;
		this.user = new this.ivle.user(this.usertoken);
		
		var that = this;
		if (this.bootstrap.modules) {
			//modules availible on server
			var modules = _.map(this.bootstrap.modules, function(module){
				var x = new m.Module(module,{user: this.user});
				return x;
			}, this);
			this.modules = new m.Modules(modules,{user: this.user});
			this.modules.fetch();
		} else {
			this.loading();
			this.modules = new m.Modules([],{user: this.user});
			this.modules.fetch(function(){
				that.stoploading();
			});
		}
		this.render();
		this.validateuser();

		var router = new AppRouter({parent: this});
		Backbone.history.start({pushState: true});
	},
	validateuser: function(){
		var that = this;
		this.user.validate(function(data){
			if (data.Success === false){
				//console.log('validation failed');
			} else {
				if (data.Token !== that.usertoken) {
					//update user token on client.
					that.usertoken = data.Token;
					that.user.setauthtoken(that.usertoken);

					//reset app state.
					that.modules.fetch();
				}
				
				var datere = /^\/Date\((.*)+.*\)\//;
				var match = datere.exec(data.ValidTill);
				var date = match ? new Date(parseInt(match[1], 10)) : match;

				if (date && (date !== that.bootstrap.date || that.usertoken !== that.bootstrap.token)){
					//save state
					$.ajax({
						type: 'POST',
						url: "/auth",
						data: {token : that.usertoken, date: date},
						success: function(data){
							//console.log(data);
						},
						dataType: 'json'
					});
				}

				
			}
		}, function(){
			//error callback.
		});
	},
	loading: function(){
		$('.loading').html("please be patient, loading your modules...");
		$('#overlay').show();
		var that = this;
		$('#close').click(function(){
			that.stoploading();
		});
	},
	stoploading: function(){
		$('.loading').html("");
		$('#overlay').hide();
	},
	render: function(){
		this.mainview = new v.MainView({
			user: this.user,
			modules: this.modules
		});
		this.mainview.render();
	},
	logout: function(){
		var re = new RegExp("^(.+" + window.location.host+ ")");
		var logout =  re.exec(window.location.href)[1] + "/logout";
		window.location.href = logout;
	},
	events: {
		'click #logout': "logout"
	}
});

return App;
});
