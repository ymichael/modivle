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

var ModIvleRouter = Backbone.Router.extend({
	initialize: function(options){
		this.parent = options.parent;
	},
	routes: {
		"*hash" : "update"
	},
	update: function(hash){
		this.init(hash.split("/"));
	},
	init: function(update){
		//main blank page
		if (update && update[0] == "" && this.parent.mainview){
			return this.parent.mainview.home();
		}

		var hash = window.location.hash;
		var filepath = update || hash.split("/").slice(1);
		
		if (this.parent.modules){
			var mod = _.find(this.parent.modules.models, function(module){
				return module.simpleinfo.code == filepath[0];
			}, this);

			var folder = filepath.slice(1);
			var found;
			
			//does not match any module. 
			if (!mod) return this.navigate("");
			
			//fetchworkbin.
			mod.fetchworkbin();
			
			if (folder.length == 0){
				found = mod.workbin;
			} else {
				var current = mod.workbin;
				while (folder.length > 0) {
					var nested = _.find(current.items.models, function(item){
						return item.simpleinfo.name == folder[0];
					}, this);
					if (nested){
						if (folder.length == 1){
							//found the folder;
							found = nested;
						}
						//remove first item in array.
						folder = folder.slice(1);
						current = nested;
					} else {
						//end loop;
						folder = [];
					}
				}
			}
			if (found){
				this.parent.mainview.modulesview.active(mod.simpleinfo.code);
				this.parent.mainview.drilldown(null, found);
			} else {
				//reset the hash tag. invalid
				this.navigate("");
			}
		}
		
		
	}
});

var ModIvle = Backbone.View.extend({
	el: "#container",
	initialize: function(){
		var apikey = "ba1ge5NQ9cl76KQNI1Suc";
		this.ivle = new ivle(apikey, '/proxy/');
		_.bindAll(this, 'init');

		//app router
		this.router = new ModIvleRouter({parent: this});
		//Backbone.history.start({pushState: true, root: "/welcome"});
		Backbone.history.start({root: "/welcome"});
	},
	init: function(){
		this.bootstrap = bootstrap;
		if (this.bootstrap.token){
			//authenticated
			this.usertoken = this.bootstrap.token;
			this.user = new this.ivle.user(this.usertoken);
			
			if (this.bootstrap.modules) {
				//modules availible on server
				var that = this;
				var modules = _.map(this.bootstrap.modules, function(module){
					// console.log(module);
					var x = new m.Module(module);
					// console.log(module);
					x.user = that.user;
					return x;
				}, that);
				this.modules = new m.Modules(modules,{user: this.user});
				this.modules.update();	
			} else {
				var that = this;
				this.loading();
				this.modules = new m.Modules([],{user: this.user});
				this.modules.fetch(function(){
					that.stoploading();
				});	
			}
			//user modules
			this.render();
			this.router.init();
		} else {
			//not authenticated
			this.renderlogin();
		}
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
	logout: function(){
		var re = new RegExp("^(.+" + window.location.host+ ")");
		var logout =  re.exec(window.location.href)[1] + "/logout";
		window.location.href = logout;
	},
	navigateto: function(e, hash){
		this.router.navigate("#/" + hash);
	},
	events: {
		'click #logout': "logout",
		'navigateto' : "navigateto"
	}
});

return ModIvle;
});
