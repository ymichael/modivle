define(['jquery','underscore','backbone', 'ich'],
function($,_,Backbone,ich){

var v = {};

//modules
v.ModulesView = Backbone.View.extend({
	initialize: function(){
		this.collection.on('reset', this.render, this);
		this.collection.on('add', this.render, this);
		this.$el.addClass('loading');
	},
	render: function(){
		var fragment = document.createDocumentFragment();
		_.each(this.collection.models, function(module){
			var x = new v.ModuleView({model: module});
			fragment.appendChild(x.render().el);
		},this);
		this.$el.html(fragment);
		this.$el.removeClass('loading');
		return this;
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
	}
});




v.MainView = Backbone.View.extend({
	el: "#main_container",
	initialize: function(options){
		this.user = options.user;
		this.modules = options.modules;
		
		_.bindAll(this, 'render', 'moduleselected','fixheight');
		// this.modules.on('reset', this.fixheight, this);
	},
	render: function(){
		this.$el.html(ich.mainview());
		// //resize divs
		// this.$("#leftbar").height($(window).height() - 50);
		// this.$("#contentcontainer").height($(window).height() - 50);
		
		//populate left bar
		this.modulesview = new v.ModulesView({collection: this.modules});
		this.$('#leftbar').append(ich.usersnapshot());
		this.$('#leftbar').append(this.modulesview.render().el);
		return this;
	},
	fixheight: function(){
		var fixheight = function(){
			var winheight = $(window).height() - 50;
			var height = winheight < $("#leftbar").children().length * 120 ? $("#leftbar").children().length * 170 : winheight;

			$("#leftbar").height(height);
			$("#contentcontainer").height($(window).height() - 50);
			// $("#contentcontainer").height(height).width($(window).width()-205);
		};
		var lazyresize = _.debounce(fixheight, 300);
		
		//bind resize event
		$(window).resize(lazyresize);
		
		//call once
		$(window).resize();
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
	},
	render: function(){
		//mainframe
		this.$el.html(ich.workbinview());

		//render breadcrumbs
		this.breadcrumbs = new v.WorkbinBreadcrumbs({model: this.currentitem, el: this.$('.breadcrumbs')});
		this.breadcrumbs.render();


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
		return this;
	}
});
v.FileView = Backbone.View.extend({
	className: 'itemview fileview',
	initialize: function(){},
	render: function(){
		this.$el.html(ich.itemview(this.model.simpleinfo));
		return this;
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