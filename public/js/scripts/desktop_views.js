/*global define:true */
define(['jquery','underscore','backbone', 'ich'],
function($,_,Backbone,ich){

var v = {};
/*
MAIN
*/
v.MainView = Backbone.View.extend({
	el: "#main_container",
	initialize: function(options){
		this.user = options.user;
		this.modules = options.modules;
		_.bindAll(this, 'render', 'moduleselected');
	},
	render: function(){
		this.modulesview = new v.ModulesView({collection: this.modules}).render();
		this.contentview = new v.ContentView({user: this.user}).render();
		return this;
	},
	events: {
		"moduleselected" : "moduleselected"
	},
	moduleselected: function(e, module){
		this.contentview.changemodule(module);
	}
});
v.ModulesView = Backbone.View.extend({
	el: "#leftbar",
	initialize: function(){
		this.collection.on('reset', this.render, this);
		this.collection.on('add', this.render, this);
	},
	render: function(){
		this.views = [];
		var fragment = document.createDocumentFragment();
		_.each(this.collection.models, function(module){
			var x = new v.ModuleView({model: module});
			this.views.push(x);
			fragment.appendChild(x.render().el);
		},this);
		this.$el.html(fragment);
		return this;
	},
	moduleselected: function(e, module){
		this.active(module.get("code"));
	},
	active: function(modcode){
		this.$(".active").removeClass("active");
		_.each(this.views, function(view){
			if (view.model.get("code") === modcode){
				view.active();
			}
		}, this);
	},
	events: {
		"moduleselected" : "moduleselected"
	}
});
v.ModuleView = Backbone.View.extend({
	className: "moduleview",
	initialize: function(){
	},
	render: function(){
		this.$el.html(ich.moduleview(this.model.toJSON()));
		return this;
	},
	events: {
		"click" : "moduleselected"
	},
	moduleselected: function(){
		this.$el.trigger('moduleselected', this.model);
	},
	active: function(){
		this.$el.addClass("active");
	}
});
v.ContentView = Backbone.View.extend({
	el: "#content",
	initialize: function(options){
		this.user = options.user;
		this.module = null;
		this.currentview = null;
		this.defaultview = "announcements";
		_.bindAll(this, 'render','changemodule','changeview');
	},
	render: function(){
		if (this.module === null) {
			//show home page

		} else {
			//only called once.
			this.$el.html(ich.contentview());
			this.contentnav = new v.ContentNavView({
				view: this.defaultview
			}).render();

			this.contentcontainer = new v.ContentContainerView({
				user: this.user,
				module : this.module,
				view : this.defaultview
			}).render();
		}
		return this;
	},
	changemodule: function(module){
		if (this.module === null){
			//only called the first time.
			this.module = module;
			this.render();
		} else {
			//subsequently...
			this.module = module;
			this.contentcontainer.changemodule(this.module);
		}
	},
	changeview: function(e, view){
		this.currentview = view;
		this.contentcontainer.changeview(view);
	},
	events: {
		"changeview" : "changeview"
	}
});
v.ContentNavView = Backbone.View.extend({
	el: "#tabs",
	initialize: function(options){
		this.views = ["announcements", "workbin", "forum"];
		this.children = [];
		this.currentview = options.view;
	},
	render: function(){
		var fragment = document.createDocumentFragment();
		_.each(this.views, function(view){
			var x = new v.ContentNavItemView({name: view});
			this.children.push(x);
			fragment.appendChild(x.render().el);
		},this);
		this.$el.html(fragment);
		this.changeview(null,this.currentview);
		return this;
	},
	events: {
		"changeview" : "changeview"
	},
	changeview: function(e, view){
		_.each(this.children, function(navitem){
			if (navitem.name === view){
				navitem.active();
			} else {
				navitem.inactive();
			}
		}, this);
	}
});
v.ContentNavItemView = Backbone.View.extend({
	tagName: "div",
	className: "tab",
	initialize: function(options){
		this.name = options.name;
	},
	render: function(){
		this.$el.html(this.name);
		return this;
	},
	events: {
		"click" : "changeview"
	},
	changeview: function(){
		if (!this.$el.hasClass("active")){
			this.$el.trigger("changeview", this.name);
		}
	},
	active: function(){
		this.$el.addClass("active");
	},
	inactive: function(){
		this.$el.removeClass("active");
	}
});
v.ContentContainerView = Backbone.View.extend({
	el: "#tabcontent",
	initialize: function(options){
		this.user = options.user;
		this.module = options.module;
		this.currentview = options.view;
	},
	render: function(){
		var Backboneview = this.view(this.currentview);
		var x = new Backboneview({
			user: this.user,
			model: this.module
		});
		this.$el.html(x.render().el);
		return this;
	},
	view: function(view){
		if (view === "workbin"){
			return v.WorkbinView;
		} else if (view === "announcements"){
			return v.AnnouncementsView;
		} else if (view === "forum"){
			return v.ForumView;
		}
	},
	changemodule: function(module){
		this.module = module;
		this.render();
	},
	changeview: function(view){
		this.currentview = view;
		this.render();
	}
});

/*
FORUM
*/
v.ForumView = Backbone.View.extend({
	initialize: function(options){
		this.user = options.user;
		this.forum = this.model.fetchforums().forum;
		this.currentview = "headings";
	},
	render: function(){
		//main frame
		this.$el.html(ich.forumview(this.forum.toJSON()));
		this.headingsview = new v.ForumHeadingsView({collection: this.forum.headings});
		this.$("#forumcontainer").html(this.headingsview.render().el);
		return this;
	},
	events: {
		"forumheadingselected" : "forumheadingselected",
		"forumthreadselected" : "forumthreadselected"
	},
	forumthreadselected: function(e, thread){
		var singlethreadview = new v.ForumSingleThreadView({model: thread});
		this.$("#forumcontainer").html(singlethreadview.render().el);
	},
	forumheadingselected: function(e, heading){
		//showthreadsview
		var threadsview = new v.ForumThreadsView({model: heading});
		this.$("#forumcontainer").html(threadsview.render().el);
	}
});
//FORUM HEADINGS
v.ForumHeadingsView = Backbone.View.extend({
	id: "forumheadingsview",
	className: "forumsheet",
	initialize: function(){
		this.collection.on("reset", this.render, this);
	},
	render: function(){
		if (this.collection.isloading()){
			this.$el.html(ich.inforow({text:"loading..."}));
		} else if (this.collection.models.length === 0){
			this.$el.html(ich.inforow({text:"no headings"}));
		} else {
			var fragment = document.createDocumentFragment();
			_.each(this.collection.models, function(heading){
				var x = new v.ForumHeadingView({model: heading});
				fragment.appendChild(x.render().el);
			});
			this.$el.html(fragment);
		}
		return this;
	}
});
v.ForumHeadingView = Backbone.View.extend({
	className: "tabrow",
	initialize: function(){

	},
	render: function(){
		this.$el.html(ich.forumheadingview(this.model.toJSON()));
		return this;
	},
	events: {
		"click" : "forumheadingselected"
	},
	forumheadingselected: function(){
		this.$el.trigger("forumheadingselected", this.model);
	}
});
//FORUM THREADS
v.ForumThreadsView = Backbone.View.extend({
	id: "forumthreadsview",
	className: "forumsheet",
	tagName: "div",
	initialize: function(){
		this.model.threads.on("reset", this.render, this);
	},
	render: function(){
		if (this.model.threads.isloading()){
			this.$el.html(ich.inforow({text:"loading..."}));
		} else if (this.model.threads.models.length === 0){
			this.$el.html(ich.inforow({text:"zero threads."}));
		} else {
			var fragment = document.createDocumentFragment();
			_.each(this.model.threads.models, function(thread){
				var x = new v.ForumThreadsThreadView({model: thread});
				fragment.appendChild(x.render().el);
			});
			this.$el.html(fragment);
		}
		return this;
	}
});
v.ForumThreadsThreadView = Backbone.View.extend({
	className: "tabrow",
	initialize: function(){

	},
	render: function(){
		this.$el.html(ich.forumthreadsthreadview(this.model.toJSON()));
		return this;
	},
	events: {
		"click" : "forumthreadselected"
	},
	forumthreadselected: function(){
		this.$el.trigger("forumthreadselected", this.model);
	}
});
//FORUM SINGLE THREAD VIEW
v.ForumSingleThreadView = Backbone.View.extend({
	id: "forumsinglethreadview",
	className: "forumsheet",
	initialize: function(){
		this.model.fetch();
		this.model.on("reset", this.render, this);
	},
	render: function(){
		//this post.
		var root = new v.ForumSingleThreadThreadView({model: this.model});
		this.$el.html(root.render().el);
		return this;
	}
});
v.ForumSingleThreadThreadView = Backbone.View.extend({
	className: "tabpost forumpost",
	initialize: function(){

	},
	render: function(){
		this.$el.html(ich.forumpost(this.model.toJSON()));
		
		if (this.model.threads.length !== 0) {
			_.each(this.model.threads, function(subthread){
				var x = new v.ForumSingleThreadThreadView({model: subthread});
				this.$(".subthreads").append(x.render().el);
			}, this);
		}
		return this;
	}
});

/*
ANNOUNCEMENTS
*/
v.AnnouncementsView = Backbone.View.extend({
	className: "announcementsview",
	tagName: "div",
	initialize: function(options){
		this.user = options.user;
		this.announcements = this.model.fetchannouncements().announcements;
		this.announcements.on('change', this.render, this);
	},
	render: function(){
		if (this.announcements.isloading()){
			this.$el.html(ich.inforow({text:"loading..."}));
		} else if (this.announcements.models.length === 0){
			//no announcements
			this.$el.html(ich.inforow({text:"no announcements."}));
		} else {
			var fragment = document.createDocumentFragment();
			_.each(this.announcements.models, function(announcement){
				var x = new v.AnnouncementView({model: announcement});
				fragment.appendChild(x.render().el);
			},this);
			this.$el.html(fragment);
			
			//open latest
			this.$(".announcementview:first-child").click();
		}
		return this;
	}
});
v.AnnouncementView = Backbone.View.extend({
	tagName: 'div',
	className: 'announcementview tabpost',
	initialize: function(options){

	},
	render: function(){
		this.$el.html(ich.announcementview(this.model.toJSON()));
		return this;
	}
});

/*
WORKBIN
*/
v.WorkbinView = Backbone.View.extend({
	initialize: function(options){
		this.user = options.user;
		this.currentitem = this.model.fetchworkbin().workbin;
		this.currentitem.on('all', this.render, this);
	},
	render: function(){
		//mainframe
		this.$el.html(ich.workbinview());
		//render breadcrumbs
		this.breadcrumbs = new v.WorkbinBreadcrumbs({model: this.currentitem, el: this.$('#workbinheading')});
		this.breadcrumbs.render();
		if (typeof this.currentitem.get('id') !== 'undefined'){
			if(this.currentitem.items.models.length === 0){
				//empty folder
				this.$('#filescontainer').html(ich.emptyfolder());
			} else {
				//files and folders
				var fragment = document.createDocumentFragment();
				//reverse models to show latest files at the top.
				_.each(this.currentitem.items.models, function(item){
					var x;
					if (item.get("type") === 'document'){
						x = new v.FileView({model: item});
						fragment.appendChild(x.render().el);
					} else if (item.get("type") === 'folder'){
						x = new v.FolderView({model: item});
						fragment.appendChild(x.render().el);
					}
				},this);
				this.$('#filescontainer').html(fragment);
			}
		} else {
			//loading folder
			this.$('#filescontainer').html(ich.loadingfolder());
		}
		return this;
	},
	events: {
		"drilldown": "drilldown",
		"downloadfile" : "downloadfile"
	},
	drilldown: function(e, model){
		this.currentitem = model;
		this.render();
	},
	downloadfile: function(e, file){
		this.user.file(file.id);
	}
});
v.WorkbinBreadcrumb = Backbone.View.extend({
	className: 'breadcrumb',
	initialize: function(options){
		this.type = options.type;
	},
	render: function(){
		if (this.model.parent){
			this.$el.html(ich.breadcrumb(this.model.toJSON()));
		} else {
			this.$el.html(ich.breadcrumbworkbin());
		}
		this.$el.addClass(this.type);
		return this;
	},
	events: {
		"click": "drilldown"
	},
	drilldown: function(){
		if (this.type === "parent"){
			this.$el.trigger('drilldown', this.model);
		}
	}
});
v.WorkbinBreadcrumbs = Backbone.View.extend({
	initialize: function(){},
	render: function(){
		var current = this.model.parent;
		
		if (!current) {
			return this;
		}

		while (current){
			var x = new v.WorkbinBreadcrumb({model: current, type: "parent"});
			this.$el.prepend(x.render().el);
			current = current.parent;
		}

		//add current folder
		var currentfolder = new v.WorkbinBreadcrumb({model: this.model, type: "current"});
		this.$el.append(currentfolder.render().el);
		return this;
	}
});
v.FileView = Backbone.View.extend({
	className: 'tabrow itemview fileview',
	initialize: function(){},
	render: function(){
		this.$el.html(ich.itemview(this.model.toJSON()));
		this.itemicon();
		return this;
	},
	itemicon: function(){
		var type = this.model.get("filetype");
		var fileTypes = {
			zip : "zip",
			doc : "doc",
			docx : "doc", // Redirect docx to doc's icon.
			pdf : "pdf",
			ppt : "ppt",
			pptx : "ppt", // Redirect pptx to ppt's icon.
			xls : "xls",
			xlsx : "xlsx",
			acc : "acc",
			avi : "avi",
			bmp : "bmp",
			c : "c",
			cpp : "cpp",
			dmg : "dmg",
			exe : "exe",
			flv : "flv",
			gif : "gif",
			h : "h",
			html : "html",
			ics : "ics",
			java : "java",
			jpg : "jpg",
			key : "key",
			mp3 : "mp3",
			mid : "mid",
			mp4 : "mp4",
			mpg : "mpg",
			php : "php",
			png : "png",
			psd : "psd",
			py : "py",
			qt : "qt",
			rar : "rar",
			rb : "rb",
			rtf :  "rtf",
			sql : "sql",
			tiff : "tiff",
			txt : "txt",
			wav : "wav",
			xml : "xml"
		};

		var defaultfile = "_blank";
		var bg = _.has(fileTypes, type) ? fileTypes[type] : defaultfile;

		bg = "url(/img/filetypes/" + bg + ".png)";
		this.$('.rowicon').css("background-image", bg);
	},
	events: {
		"click" : "downloadfile"
	},
	downloadfile: function(){
		this.$el.trigger('downloadfile', this.model);
	}
});
v.FolderView = Backbone.View.extend({
	className: 'tabrow itemview folderview',
	initialize: function(){
		_.bindAll(this,'drilldown');
	},
	render: function(){
		this.$el.html(ich.itemview(this.model.toJSON()));
		return this;
	},
	events: {
		"click" : "drilldown"
	},
	drilldown: function(){
		this.$el.trigger('drilldown', this.model);
	}
});

return v;
});