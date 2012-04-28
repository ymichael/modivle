/*global define:true */
define(['jquery','underscore','backbone', 'ich'],
function($,_,Backbone,ich){

var v = {};

v.MainView = Backbone.View.extend({
	el: "#main_container",
	initialize: function(options){
		this.user = options.user;
		this.modules = options.modules;
		_.bindAll(this, 'render', 'moduleselected');
	},
	render: function(){
		//populate left bar
		this.modulesview = new v.ModulesView({collection: this.modules}).render();
		this.contentview = new v.ContentView({user: this.user}).render();
		return this;
	},
	events: {
		"moduleselected" : "moduleselected",
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
		this.active(module.simpleinfo.code);
	},
	active: function(modcode){
		this.$(".active").removeClass("active");
		_.each(this.views, function(view){
			if (view.model.simpleinfo.code === modcode){
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
		this.$el.html(ich.moduleview(this.model.simpleinfo));
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
		this.defaultview = "workbin";
		_.bindAll(this, 'render');
	},
	render: function(){
		if (this.module === null){
			//home screen
			
		} else {
			//show current view + module
			this.$el.html(ich.contentview());
			var view = this.currentview === null ? this.defaultview : this.currentview;
			var viewobj = this.view(view);
			var x = new viewobj({model: this.module, user: this.user});
			this.$("#tabcontent").html(x.render().el);
		}
		return this;
	},
	changemodule: function(module){
		this.module = module;
		this.render();
	},
	view: function(view){
		if (view === "workbin"){
			return v.WorkbinView;
		} else if (view === "announcements"){
			return v.AnnouncementsView;
		} else if (view === "forum"){
			return v.ForumView;
		}
	}
});

v.ForumView = Backbone.View.extend({

});
v.AnnouncementsView = Backbone.View.extend({

});

// Workbin View
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
		this.breadcrumbs = new v.WorkbinBreadcrumbs({model: this.currentitem, el: this.$('.breadcrumbs')});
		this.breadcrumbs.render();
		if (typeof this.currentitem.get('ID') !== 'undefined'){
			if(this.currentitem.items.models.length === 0){
				//empty folder
				this.$('#filescontainer').html(ich.emptyfolder());
			} else {
				//files and folders
				var fragment = document.createDocumentFragment();
				//reverse models to show latest files at the top.
				_.each(this.currentitem.items.models, function(item){
					var x;
					if (item.type === 'document'){
						x = new v.FileView({model: item});
						fragment.appendChild(x.render().el);
					} else if (item.type === 'folder'){
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
		this.$el.html(ich.breadcrumb(this.model.simpleinfo));
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
	className: 'itemview fileview',
	initialize: function(){},
	render: function(){
		this.$el.html(ich.itemview(this.model.simpleinfo));
		this.itemicon();
		return this;
	},
	itemicon: function(){
		var type = this.model.simpleinfo.filetype;
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
		this.$('.itemicon').css("background-image", bg);
	},
	events: {
		"click" : "downloadfile"
	},
	downloadfile: function(){
		this.$el.trigger('downloadfile', this.model);
	}
});
v.FolderView = Backbone.View.extend({
	className: 'itemview folderview',
	initialize: function(){
		_.bindAll(this,'drilldown');
	},
	render: function(){
		this.$el.html(ich.itemview(this.model.simpleinfo));
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