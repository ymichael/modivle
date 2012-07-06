/*global define:true, mixpanel _gaq bootstrap */
define([
	'jquery',
	'underscore',
	'backbone',
	'ich',
	'ivle',
	'models',
	'views',
	'text!templates/mobile.html'
],
function($,_,Backbone,ich,Ivle,m,v,templates){
$('body').append(templates);
ich.grabTemplates();

var AppRouter = Backbone.Router.extend({
	initialize: function(options){
		this.parent = options.parent;
	},
	routes: {
		":mod/workbin*stuff" : "workbin",
		":mod/announcements" : "announcements",
		":mod/forum*stuff" : "forum",
		"*mod" : "module"
	},
	module: function(mod){
		//check if mod == valid module.
		var module = this.checkmod(mod);
		if (module) {
			//select module.
			this.parent.mainview.moduleselected(null, module);
		} else {
			//revert url base.
			this.navigate("");
			this.parent.mainview.home();
		}
	},
	workbin: function(mod, stuff){
		var module = this.checkmod(mod);
		if (!module) {
			return this.navigate("");
		}

		//breakdown "stuff"
		if (stuff) {
			var paths = stuff.split("/").slice(1);

			var currentitem, parentitem = module.workbin;
			while (paths.length !== 0) {
				currentitem = _.find(parentitem.items.models, function(item){
					return this.sanitize(item.get('path')) === paths[0];
				},this);

				if (currentitem){
					parentitem = currentitem;
				} else {
					break;
				}
				paths = paths.slice(1);
			}
			
			if (currentitem) {
				this.parent.mainview.moduleselected(null, module);
				this.parent.mainview.singlemoduleview.changeview(null, "workbin");
				this.parent.mainview.singlemoduleview.content.drilldown(null, currentitem);
			} else {
				this.parent.mainview.moduleselected(null, module);
				this.parent.mainview.singlemoduleview.changeview(null, "workbin");
				return this.navigateto(module.get('code'), "workbin");
			}
		} else {
			this.parent.mainview.moduleselected(null, module);
			this.parent.mainview.singlemoduleview.changeview(null, "workbin");
		}
	},
	announcements: function(mod){
		var module = this.checkmod(mod);
		if (!module) {
			return this.navigate("");
		}
		
		this.parent.mainview.moduleselected(null, module);
		this.parent.mainview.singlemoduleview.changeview(null, "announcements");
	},
	forum: function(mod, stuff){
		var module = this.checkmod(mod);
		if (!module) {
			return this.navigate("");
		}

		//breakdown "stuff"
		if (stuff) {
			var paths = stuff.split("/").slice(1);
			var currentitem, parentitem = module.forum;
			while (paths.length !== 0) {
				var collection = parentitem.headings || parentitem.threads;
				currentitem = _.find(collection.models, function(item){
					return this.sanitize(item.get('path')) === paths[0];
				},this);
				if (currentitem){
					parentitem = currentitem;
				} else {
					break;
				}
				paths = paths.slice(1);
			}

			if (currentitem) {
				this.parent.mainview.moduleselected(null, module);
				this.parent.mainview.singlemoduleview.changeview(null, "forum");
				this.parent.mainview.singlemoduleview.content.drilldown(null, currentitem);
			} else {
				this.parent.mainview.moduleselected(null, module);
				this.parent.mainview.singlemoduleview.changeview(null, "forum");
				return this.navigateto(module.get('code'), "forum");
			}
		} else {
			this.parent.mainview.moduleselected(null, module);
			this.parent.mainview.singlemoduleview.changeview(null, "forum");
		}
	},
	checkmod: function(mod){
		return _.find(this.parent.modules.models, function(loadedmodules){
				return this.sanitize(loadedmodules.get('code')) === this.sanitize(mod.toLowerCase());
		}, this);
	},
	sanitize: function(path){
		return path.replace(/\//g, "-").replace(/ /g, "").toLowerCase();
	},
	navigateto: function(){
		var path = _.map(arguments, function(arg){
			return this.sanitize(arg);
		},this);

		//mixpanel
		if (path.length > 1) {
			var section = path[1];
			mixpanel.track(section);
		}

		this.navigate(path.join("/"));
		this.trackpageview();
	},
	trackpageview: function(){
		var url = Backbone.history.getFragment();
		_gaq.push(['_trackPageview', "/" + url]);
	}
});

var App = Backbone.View.extend({
	el: "#container",
	initialize: function(){
		var apikey = "ba1ge5NQ9cl76KQNI1Suc";
		this.ivle = new Ivle(apikey, '/proxy/');

		//app router
		this.router = new AppRouter({parent: this});

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
		
		//uniquely id user.
		var user = this.bootstrap.user;
		if (!user) {
			that.user.uid(function(uid){
				that.user.email(function(email){
					that.user.uname(function(uname){
						//save state
						$.ajax({
							type: 'POST',
							url: "/user",
							data: {
								uid: uid,
								email: email
							},
							success: function(data){
								//console.log(data);
							},
							dataType: 'json'
						});
						that.bootstrap.user = {
							uname: uname,
							uid: uid,
							email: email
						};
						mixpanel.identify(uid);
						mixpanel.people.set({
							"$name": uname,
							"$email": email
						});
					});
				});
			});
		} else {
			mixpanel.identify(user.uid);
		}
	},
	loading: function(){
		$('#overlay')
			.html(ich.loading())
			.show();

		var that = this;
		$('#overlay_close').on('tap',function(){
			that.stoploading();
		});
	},
	stoploading: function(){
		$('#overlay')
			.html("")
			.hide();
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
	home: function(){
		this.mainview.home();
		this.navigateto("");
	},
	navigateto: function(e){
		var args = Array.prototype.slice.call(arguments, 1);
		this.router.navigateto.apply(this.router, args);
	},
	events: {
		'tap #logout': "logout",
		'tap #home' : "home",
		'navigateto' : "navigateto"
	}
});

return App;
});
