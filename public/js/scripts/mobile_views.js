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
		this.header = new v.HeaderView().render();
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
	}
});
v.HeaderView = Backbone.View.extend({
	el: "header",
	render: function(){
		return this;
	},
	modulepage: function(code){
		this.$el.html(ich.singlemoduleheader({code : code}));
	}
});
v.ModulesView = Backbone.View.extend({
	initialize: function(){

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
		this.defaultview = "announcements";
		this.user = options.user;
	},
	render: function(){
		this.nav = new v.SingleModuleNav({current: this.defaultview});
		this.$el.append(this.nav.render().el);

		var view = this.view(this.defaultview);


		this.content = new view({
			model: this.model,
			user: this.user
		})
		this.$el.append(this.content.render().el);

		return this;
	},
	view : function(view){
		if (view === "announcements"){
			return v.AnnouncmentsView;
		} else if (view === "workbin"){
			return v.WorkbinView;
		}
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
	}
});

return v;
});