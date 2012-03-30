define(['jquery', 'underscore', 'backbone'], 
function($,_,Backbone){
	
var m = {};
m.Items = Backbone.Collection.extend({});
m.Folder = Backbone.Model.extend({
	initialize: function(attr, parent){
		//link to parent folder
		this.parent = parent;
		
		this.type = "folder";
		var simpleinfo = {};
		simpleinfo.name = this.get('FolderName');
		var count = this.get('FileCount')
		if (count == 0){
			simpleinfo.size = "empty";
		} else {
			simpleinfo.size = (count + this.get('Folders').length) + " items";	
		}
		
		simpleinfo.type = "folder";
		this.simpleinfo = simpleinfo;

		this.init();

		this.set({id : this.get('ID')});
	},
	init: function(){
		this.items = new m.Items();
		var files = _.map(this.get('Files'), function(file){
			return new m.File(file, this);
		}, this);
		var folders = _.map(this.get('Folders'), function(folder){
			return new m.Folder(folder, this);
		}, this);
		this.items.add(folders);
		this.items.add(files);
	}
});
m.File = Backbone.Model.extend({
	initialize: function(attr, parent){
		//link to parent folder
		this.parent = parent;

		//obj type
		this.type = "document";

		//relevant info (for display)
		var simpleinfo = {};
		simpleinfo.name = this.get('FileName');
		simpleinfo.description = this.get('FileDescription');
		var bytes = this.get('FileSize');

		simpleinfo.size = this.calcfilesize(bytes);
		simpleinfo.filetype = this.get('FileType')
		simpleinfo.type = this.get('FileType')+ " document";
		this.simpleinfo = simpleinfo;

		this.set({id : this.get('ID')});
	},
	calcfilesize: function(bytes){
		unit = ["bytes", "KB", "MB", "GB"];
		index = 0;
		while (Math.floor(bytes).toString().length > 3){
			index++
			bytes = parseInt(bytes, 10);
			bytes = bytes / Math.pow(2, 10);
		}

		return bytes.toFixed(2).toString().slice(0,6) + " " + unit[index];
	}
});

m.Workbin = Backbone.Model.extend({
	initialize: function(){
		this.fields();
		var simpleinfo = {};
		simpleinfo.type = "folder";
		this.simpleinfo = simpleinfo;
		this.on('change', this.fields, this);
		_.bindAll(this, 'setname');
	},
	fields: function(){
		var x = _.map(this.get('Folders'), function(folder){
			return new m.Folder(folder, this);
		},this);
		this.items = new m.Items(x);
	},
	setname: function(name){
		this.simpleinfo.name = name;
	}
});


m.Module = Backbone.Model.extend({
	initialize: function(options){
		_.bindAll(this, 'fetchworkbin');
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
		this.set({id: this.get('ID')});
		this.workbin = new m.Workbin();
		this.workbin.setname(simpleinfo.code);
	},
	fetchworkbin: function(){
		var that = this;
		this.user.workbin(this.id, function(data){
			that.workbin.set(data.Results[0]);
		});
		return this;
	}
});
m.Modules = Backbone.Collection.extend({
	initialize: function(models, options){
		this.user = options.user;
		_.bindAll(this, 'fetch','update');
	},
	model: m.Module,
	fetch: function(callback){
		var that = this;
		this.user.modules(function(data){
			var modules = _.map(data.Results, function(module){
				var x = new m.Module(module);
				x.user = that.user;
				return x;
			}, that);
			that.reset(modules);
			callback();
			
			var modules = JSON.stringify(data.Results);
			//save state
			$.ajax({
			  type: 'POST',
			  url: "/modules",
			  data: {modules : modules},
			  success: function(data){
			  	//console.log(data);
			  },
			  dataType: 'json'
			});
		});
	},
	update: function(callback){
		var that = this;
		this.user.modules(function(data){
			var changes = _.filter(data.Results,function(module){
				return ! that.get(module.ID);
			},that)
			
			if (changes.length > 0){
				var modules = _.map(changes, function(module){
					var x = new m.Module(module);
					x.user = that.user;
					return x;
				}, that);
	
				that.add(modules);
				var modules = JSON.stringify(data.Results);
				//save state
				$.ajax({
				  type: 'POST',
				  url: "/modules",
				  data: {modules : modules},
				  success: function(data){
				  	// console.log(data);
				  },
				  dataType: 'json'
				});
			}
		});
	}
});
return m;
});


