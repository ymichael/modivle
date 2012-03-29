define([
	  'jquery'
	, 'underscore'
	, 'backbone'
	, 'ich'
	, 'ivle'
	// , 'appmodels'
	// , 'appviews'
	, 'text!templates/template.html'
], 
function($,_,Backbone,ich,ivle,templates){
$('body').append(templates);
ich.grabTemplates();

var ModIvle = Backbone.View.extend({
	el: "#container",
	initialize: function(){
		var apikey = "ba1ge5NQ9cl76KQNI1Suc";
		this.ivle = new ivle(apikey);
	},
	init: function(){
		this.bootstrap = bootstrap;
		if (this.bootstrap.token){
			//authenticated
			this.usertoken = this.bootstrap.token;
			this.user = new this.ivle.user(this.usertoken);
			// this.user.validate(function(data){
			// 	console.log(arguments);
			// })
			this.modules = new m.Modules([],{user: this.user});
			this.modules.fetch();
			this.mainview = new MainView({
				user: this.user,
				modules: this.modules
			});
			this.$("#main_container").html(this.mainview.render().el);
		} else {
			//not authenticated
			this.renderlogin();
		}
	},
	renderlogin: function(){
		var re = new RegExp("^(.+" + window.location.host+ ")");
		var callbackurl =  re.exec(window.location.href)[1] + "/ivle/auth";

		this.$('#main_container').html(ich.login());
		this.ivle.auth(this.$('#login'), callbackurl);
	}
});

var MainView = Backbone.View.extend({
	id: "mainview",
	initialize: function(options){
		_.bindAll(this, 'render');
		this.user = options.user;
		this.modules = options.modules;
		this.modules.on('reset', this.fixheight, this);

		var fixheight = function(){
			var winheight = $(window).height() - 50;
			var height = winheight < $("#leftbar").children().length * 120 ? $("#leftbar").children().length * 170 : winheight;

			$("#leftbar").height(height);
			$("#contentcontainer").height(height).width($(window).width()-305);
		};
		var lazyresize = _.debounce(fixheight, 300);
		//bind resize event
		$(window).resize(lazyresize);
	},
	render: function(){
		this.$el.html(ich.mainview());
		//resize divs
		this.$("#leftbar").height($(window).height() - 50);
		this.$("#contentcontainer").height($(window).height() - 50).width($(window).width()-305);
		this.leftbar = new v.ModulesView({collection: this.modules, el: this.$('#leftbar')});
		return this;
	},
	fixheight: function(){
		$(window).resize();
	},
	events: {}
});
var v = {};
v.ModulesView = Backbone.View.extend({
	initialize: function(){
		this.collection.on('reset', this.render, this);
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
		if (this.model.simpleinfo.workbin){
			this.$('.moduleicons').append(ich.moduleicon({type: "workbin"}));
		}
		if (this.model.simpleinfo.gradebook){
			this.$('.moduleicons').append(ich.moduleicon({type: "gradebook"}));
		}
		if (this.model.simpleinfo.webcast){
			this.$('.moduleicons').append(ich.moduleicon({type: "webcast"}));
		}
		return this;
	}
});
var m = {};
m.Module = Backbone.Model.extend({
	initialize: function(){
		// console.log(this.attributes);
		var simpleinfo = {}
		simpleinfo.code = this.get('CourseCode');
		simpleinfo.name = this.get('CourseName');
		simpleinfo.semester = this.get('CourseSemester');
		simpleinfo.year = this.get('CourseAcadYear');
		simpleinfo.workbin = this.get('Workbins');
		simpleinfo.gradebook = this.get('Gradebooks');
		simpleinfo.webcast = this.get('Webcasts');
		simpleinfo.forum = this.get('Forums');

		this.simpleinfo = simpleinfo;
	}
});
m.Modules = Backbone.Collection.extend({
	initialize: function(models, options){
		this.user = options.user;
		_.bindAll(this, 'fetch');
	},
	model: m.Module,
	fetch: function(){
		var that = this;
		this.user.modules(function(data){
			that.reset(data.Results);
		});
	}
});

return ModIvle;
});
