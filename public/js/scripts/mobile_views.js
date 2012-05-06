/*global define:true */
define(['jquery','underscore','backbone', 'ich'],
function($,_,Backbone,ich){

var v = {};
/*
MAIN
*/
v.MainView = Backbone.View.extend({
	el: "#container",
	initialize: function(options){
		this.user = options.user;
		this.modules = options.modules;
		_.bindAll(this, 'render', 'moduleselected');
	},
	render: function(){
		//header
		this.header = new v.HeaderView();
		//contents
		this.modulesview = new v.ModulesView({collection: this.modules}).render();
		this.$("#main").html(this.modulesview.el);
		return this;
	},
	events: {
		"moduleselected" : "moduleselected"
	},
	moduleselected: function(e, module){
		this.header.modulepage(module.get("code"));

		var singlemoduleview = new v.SingleModuleView({
			model: module,
			user: this.user
		});
		this.$("#main").html(singlemoduleview.render().el);
	},
	home: function(){
		this.header.home();
		this.$("#main").html(this.modulesview.render().el);
	}
});
v.HeaderView = Backbone.View.extend({
	el: "header",
	home: function(){
		this.$el.html(ich.headerhome());
	},
	modulepage: function(code){
		this.$el.html(ich.singlemoduleheader({code : code}));
	}
});
v.ModulesView = Backbone.View.extend({
	initialize: function(){
		this.collection.on('reset', this.render, this);
		this.collection.on('add', this.render, this);
	},
	render: function(){
		var fragment = document.createDocumentFragment();
		_.each(this.collection.models, function(module){
			var x = new v.ModuleView({model: module});
			fragment.appendChild(x.render().el);
		},this);
		this.$el.html(fragment);
		return this;
	}
});
v.ModuleView = Backbone.View.extend({
	tagName: "div",
	className: "module",
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
		this.$el.trigger("moduleselected", this.model);
	}
});


/*
SINGLE MODULE VIEW
*/
v.SingleModuleView = Backbone.View.extend({
	initialize: function(options){
		this.currentview = "announcements";
		this.user = options.user;
	},
	render: function(){
		this.nav = new v.SingleModuleNav({current: this.currentview});
		this.$el.append(this.nav.render().el);

		var viewobj = this.view(this.currentview);
		this.content = new viewobj({
			model: this.model,
			user: this.user
		});
		this.$el.append(this.content.render().el);

		return this;
	},
	view : function(view){
		if (view === "announcements"){
			return v.AnnouncmentsView;
		} else if (view === "workbin"){
			return v.WorkbinView;
		}
	},
	events: {
		"changeview" : "changeview"
	},
	changeview: function(e, view){
		this.currentview = view;
		this.nav.active(this.currentview);

		this.content.remove();
		var viewobj = this.view(this.currentview);
		this.content = new viewobj({
			model: this.model,
			user: this.user
		});
		this.$el.append(this.content.render().el);
	}
});
v.SingleModuleNav = Backbone.View.extend({
	id: "nav",
	tagName: "div",
	initialize: function(options){
		this.current = options.current;
		this.tabs = ["announcements","workbin"];
		_.bindAll(this,"render");
	},
	render: function(){
		var fragment = document.createDocumentFragment();
		this.subviews = [];
		_.each(this.tabs, function(tab){
			var x = new v.SingleModuleNavTab({name: tab});
			this.subviews.push(x);
			fragment.appendChild(x.render().el);
		},this);
		this.active(this.current);
		this.$el.html(fragment);
		return this;
	},
	active: function(current){
		_.each(this.subviews, function(view){
			if (view.name === current){
				view.active();
			} else {
				view.inactive();
			}
		},this);
	}
});
v.SingleModuleNavTab = Backbone.View.extend({
	className: "tab",
	tagName: "div",
	initialize: function(options){
		this.name = options.name;
	},
	render: function(){
		this.$el.html(this.name);
		return this;
	},
	active: function(){
		this.$el.addClass("active");
	},
	inactive: function(){
		this.$el.removeClass("active");
	},
	events: {
		"click" : "changeview"
	},
	changeview: function(){
		if (!this.$el.hasClass("active")){
			this.$el.trigger("changeview", this.name);
		}
	}
});

/*
ANNOUNCEMENTS
*/
v.AnnouncmentsView = Backbone.View.extend({
	className: "announcementsview",
	initialize: function(options){
		this.user = options.user;
		this.announcements = this.model.fetchannouncements().announcements;
		this.announcements.on('all', this.render, this);
	},
	render: function(){
		if (this.announcements.isloading()){
			this.$el.html(ich.announcementsinfo({text:"loading..."}));
		} else if (this.announcements.models.length === 0){
			//no announcements
			this.$el.html(ich.announcementsinfo({text:"no announcements."}));
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
	tagName: "div",
	className: "announcement",
	initialize: function(){

	},
	render: function(){
		this.$el.html(ich.announcementtitle(this.model.toJSON()));
		return this;
	},
	events: {
		"click": "showannouncement"
	},
	showannouncement: function(){
		this.$el.toggleClass("active");
	}
});

/*
WORKBIN
*/
v.WorkbinView = Backbone.View.extend({
	className: "workbinview",
	initialize: function(options){
		this.user = options.user;
		this.currentitem = this.model.fetchworkbin().workbin;
		this.currentitem.on('all', this.render, this);
	},
	render: function(){
		this.$el.html(ich.workbinview());
		if (typeof this.currentitem.get('id') !== 'undefined'){
			if (this.currentitem.items.models.length === 0){
				this.$("#workbincontents").html(ich.workbininfo({msg : "this folder is empty."}));
			} else {
				//files and folders
				var fragment = document.createDocumentFragment();
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
				this.$('#workbincontents').html(fragment);
			}
			this.nav = new v.WorkbinNav({currentitem: this.currentitem, el : this.$('#workbinnav')}).render();
		} else {
			//loading folder...
			this.$("#workbinnav").html(ich.workbininfo({msg : "loading..."}));
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
v.WorkbinNav = Backbone.View.extend({
	initialize: function(options){
		this.currentitem = options.currentitem;
	},
	render: function(){
		var parent = this.currentitem.parent;
		if (!parent){
			this.$el.html(ich.workbinnavhome());
		} else {
			this.$el.html(ich.workbinnav({
				backitem: parent.parent ? parent.get("name") : "~",
				label : this.currentitem.get("name")
			}));
		}
		
		return this;
	},
	events: {
		"click #back" : "back"
	},
	back: function(){
		this.$el.trigger("drilldown", this.currentitem.parent);
	}
});
v.FileView = Backbone.View.extend({
	className: 'itemview fileview',
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