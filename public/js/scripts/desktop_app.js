/*global define:true, bootstrap _gaq mixpanel */
define([
	'jquery',
	'underscore',
	'backbone',
	'ich',
	'ivle',
	'models',
	'views',
	'keyboardjs'
],
function($,_,Backbone,ich,Ivle,m,v,keymaster){
//alias keymaster to keyboardjs
var key = function(keycombo, callback){
	keymaster.bind.key(keycombo, callback, function(){});
};
var KeyboardShortcuts = Backbone.View.extend({
	el: "#container",
	initialize: function(options){
		this.parent = options.parent;
		this.shortcuts();

		//state.
		this.resetstate();
	},
	shortcuts: function(){
		var that = this;
		//initialize
		key('shift + slash', function(){
			$("#overlay")
				.html(ich.keyboardshortcuts())
				.show();

			$('#overlay_close').click(function(){
				$("#overlay")
					.html("")
					.hide();
			});
		});
		key('esc', function(){
			$("#overlay")
				.html("")
				.hide();
		});

		//views
		key('g + a', function(){
			that.currentview = "announcements";
			that.parent.mainview.contentview.changeview(null, that.currentview);
		});
		key('g + w', function(){
			that.currentview = "workbin";
			that.parent.mainview.contentview.changeview(null, that.currentview);
		});
		key('g + f', function(){
			that.currentview = "forum";
			console.log('asdf');
			that.parent.mainview.contentview.changeview(null, that.currentview);
		});
		key('g + m', function(){
			that.currentview = "modules";
		});

		//navigation
		key('j', function(){
			that.up();
		});
		key('k', function(){
			that.down();
		});
		key('enter', function(){
			that.select();
		});
	},
	
	//listen to events and reset/set values accordingly.
	events: {

	},
	resetstate: function(view, index){
		this.currentview = view || "modules";
		this.currentindex = index;
	},
	incrindex: function(){
		if (typeof this.currentindex !== "number") {
			this.currentindex = 0;
		} else {
			this.currentindex += 1;
		}
		this.padindex();
		return this.currentindex;
	},
	decrindex: function(){
		if (typeof this.currentindex !== "number") {
			this.currentindex = 0;
		} else {
			this.currentindex -= 1;
		}
		this.padindex();
		return this.currentindex;
	},
	up: function(){
		var index = this.incrindex();
		this.highlight(index);
	},
	down: function(){
		var index = this.decrindex();
		this.highlight(index);
	},
	select: function(){
		var col = this.viewcollection();
		var index = this.currentindex || 0;
		
		if (this.currentview === "modules") {
			var elem = col[index];
			this.parent.mainview.moduleselected({}, elem);
		}
	},
	viewcollection: function(){
		var x, currentitem;
		if (this.currentview === "modules") {
			x = this.parent.mainview.modulesview.collection.models;
		} else if (this.currentview === "forum") {
			currentitem = this.parent.mainview.contentview.contentcontainer.viewobj.currentitem;
			if (currentitem.type === "forum") {
				x = currentitem.headings.models;
			} else if (currentitem.type === "heading") {
				x = currentitem.threads.models;
			} else if (currentitem.type === "thread") {
				x = "dontloop";
			}
		} else if (this.currentview === "workbin") {
			currentitem = this.parent.mainview.contentview.contentcontainer.viewobj.currentitem;
			x = currentitem.items.models;
		} else if (this.currentview === "announcements") {
			x = this.parent.mainview.contentview.contentcontainer.viewobj.announcements.models;
		}
		return x;
	},
	highlightobj: function(){
		var x, currentitem;
		if (this.currentview === "modules") {
			x = this.parent.mainview.modulesview;
		} else if (this.currentview === "forum") {
			currentitem = this.parent.mainview.contentview.contentcontainer.viewobj.currentitem;
			if (currentitem.type === "forum") {
				x = currentitem.headings.models;
			} else if (currentitem.type === "heading") {
				x = currentitem.threads.models;
			} else if (currentitem.type === "thread") {
				x = "dontloop";
			}
		} else if (this.currentview === "workbin") {
			x = this.parent.mainview.contentview.contentcontainer.viewobj;
		} else if (this.currentview === "announcements") {
			x = this.parent.mainview.contentview.contentcontainer.viewobj.announcements.models;
		}
		return x;
	},
	highlight: function(){
		this.highlightobj().highlight(this.currentindex);
	},
	padindex: function(){
		if (this.currentindex >= 0) {
			this.currentindex %= this.lengthofview();
		} else {
			this.currentindex = this.lengthofview() + this.currentindex;
		}
	},
	lengthofview: function(){
		var col = this.viewcollection(this.currentview);
		var len = col === "dontloop" ? this.currentindex + 1 : col.length;
		return len;
	}
});


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
				this.parent.mainview.contentview.changeview(null, "workbin");
				this.parent.mainview.contentview.contentcontainer.viewobj.drilldown(null, currentitem);
			} else {
				this.parent.mainview.moduleselected(null, module);
				this.parent.mainview.contentview.changeview(null, "workbin");
				return this.navigateto(module.get('code'), "workbin");
			}
		} else {
			this.parent.mainview.moduleselected(null, module);
			this.parent.mainview.contentview.changeview(null, "workbin");
		}
	},
	announcements: function(mod){
		var module = this.checkmod(mod);
		if (!module) {
			return this.navigate("");
		}
		
		this.parent.mainview.moduleselected(null, module);
		this.parent.mainview.contentview.changeview(null, "announcements");
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
				this.parent.mainview.contentview.changeview(null, "forum");
				this.parent.mainview.contentview.contentcontainer.viewobj.drilldown(null, currentitem);
			} else {
				this.parent.mainview.moduleselected(null, module);
				this.parent.mainview.contentview.changeview(null, "forum");
				return this.navigateto(module.get('code'), "forum");
			}
		} else {
			this.parent.mainview.moduleselected(null, module);
			this.parent.mainview.contentview.changeview(null, "forum");
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
		var section = path[1];
		mixpanel.track(section);

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
		this.modules = {};

		//app router
		this.router = new AppRouter({parent: this});

		//keyboard shortcut
		// this.keyboard = new KeyboardShortcuts({parent: this});

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
		$('#overlay_close').click(function(){
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
	navigateto: function(e){
		var args = Array.prototype.slice.call(arguments, 1);
		this.router.navigateto.apply(this.router, args);
	},
	events: {
		'click #logout': "logout",
		'navigateto' : "navigateto"
	}
});

return App;
});
