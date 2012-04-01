define(['jquery','underscore','backbone', 'ich'],
function($,_,Backbone,ich){

var v = {};

//modules
v.ModulesView = Backbone.View.extend({
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
	events: {
		"moduleselected" : "moduleselected"
	},
	moduleselected: function(e, module){
		this.active(module.simpleinfo.code);
	},
	active: function(modcode){
		this.$(".active").removeClass("active");
		_.each(this.views, function(view){
			if (view.model.simpleinfo.code == modcode){
				view.active();
			}
		}, this);
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




v.MainView = Backbone.View.extend({
	el: "#main_container",
	initialize: function(options){
		this.user = options.user;
		this.modules = options.modules;
		
		_.bindAll(this, 'render', 'moduleselected');
	},
	render: function(){
		this.$el.html(ich.mainview());
		
		//populate left bar
		this.modulesview = new v.ModulesView({collection: this.modules});
		this.$('#leftbar').append(this.modulesview.render().el);
		return this;
	},
	events: {
		"moduleselected" : "moduleselected",
		"drilldown": "drilldown",
		"downloadfile" : "downloadfile"
	},
	downloadfile: function(e, file){
		this.user.file(file.id);
	},
	moduleselected: function(e, module){
		this.workbinview = new v.WorkbinView({currentitem : module.fetchworkbin().workbin});

		//this.workbinview = new v.WorkbinView({currentitem : module.workbin});
		this.$('#contentcontainer').html(this.workbinview.render().el);
	},
	drilldown: function(e, model){
		this.workbinview.off();
		this.workbinview.remove();
		
		this.workbinview = new v.WorkbinView({currentitem : model});
		this.$('#contentcontainer').html(this.workbinview.render().el);
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
		if (this.type == "parent"){
			this.$el.trigger('drilldown', this.model);
		}
	}
});
v.WorkbinBreadcrumbs = Backbone.View.extend({
	initialize: function(){},
	render: function(){
		current = this.model.parent;
		while (current){
			var x = new v.WorkbinBreadcrumb({model: current, type: "parent"});
			this.$el.prepend(x.render().el);
			current = current.parent;
		}

		//add current folder
		var x = new v.WorkbinBreadcrumb({model: this.model, type: "current"});
		this.$el.append(x.render().el);
		return this;
	}
});

//workbin view
v.WorkbinView = Backbone.View.extend({
	initialize: function(options){
		this.currentitem = options.currentitem;
		this.currentitem.on('all', this.render, this);
		_.bindAll(this, 'sortbyname');
	},
	render: function(){
		//mainframe
		this.$el.html(ich.workbinview());

		//render breadcrumbs
		this.breadcrumbs = new v.WorkbinBreadcrumbs({model: this.currentitem, el: this.$('.breadcrumbs')});
		this.breadcrumbs.render();
		// console.log(this.currentitem);
		if (typeof this.currentitem.get('ID') != 'undefined'){
			if(this.currentitem.items.models.length == 0){
				//empty folder
				this.$('#filescontainer').html(ich.emptyfolder());
			} else {
				//files and folders
				var fragment = document.createDocumentFragment();
				_.each(this.currentitem.items.models, function(item){
					if (item.type == 'document'){
						var x = new v.FileView({model: item});
						fragment.appendChild(x.render().el);
					} else if (item.type == 'folder'){
						var x = new v.FolderView({model: item});
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
		"click #filescontainertop .itemname": "sortbyname"
	},
	sortbyname: function(){
		if (!this.sorted){
			this.currentitem.items.reset(_.sortBy(this.currentitem.items.models, function(model){
				return model.simpleinfo.name;
			}, this));
			this.render();
			this.sorted = true;
		} else {
			this.currentitem.items.reset(this.currentitem.items.models.reverse());
			this.render();
		}
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
		var filearray = [
			//put the popular ones first
			"zip", "doc", "pdf","ppt","xls", 
			"acc", "avi","bmp","c", "cpp", "dmg", "exe", "flv", "gif", "h", "html", 
			"ics", "java", "jpg", "key", "mp3", "mid", "mp4", "mpg", "php","png", 
			"psd", "py", "qt", "rar", "rb", "rtf", "sql", "tiff", "txt", "wav", 
			"xml"
		];
		var bg = _.find(filearray, function(atype){
			return atype == type;
		});
		var defaultfile = "_blank";
		bg = bg ? bg : defaultfile;

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