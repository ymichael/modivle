/*global define:true */
define(['jquery', 'underscore', 'backbone'],
function($,_,Backbone){
	
var m = {};
/*
WORKBIN
*/
m.Items = Backbone.Collection.extend({});
m.Folder = Backbone.Model.extend({
	initialize: function(attr, parent){
		//link to parent folder
		this.parent = parent;
		
		this.type = "folder";
		var simpleinfo = {};
		simpleinfo.name = this.get('FolderName');
		var count = this.get('FileCount');
		if (this.get('Folders')) {
			count = parseInt(count, 10) + this.get('Folders').length;
		}
		if (count === 0){
			simpleinfo.size = "empty";
		} else {
			simpleinfo.size = count + " items";
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
	},
	filepath: function(){
		var path = "";
		var current = this.parent;
		while (current) {
			path = current.simpleinfo.name + "/" + path;
			current = current.parent;
		}

		return path + this.simpleinfo.name;
	},
	hasnewfiles: function(){
		var x = _.find(this.items.models, function(item){
			if (item.type === 'document'){
				return item.get('dled') === 0;
			} else if (item.type === 'folder'){
				return item.hasnewfiles();
			}
		}, this);
		return x;
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
		simpleinfo.filetype = this.get('FileType');
		simpleinfo.type = this.get('FileType')+ " document";
		this.simpleinfo = simpleinfo;

		this.set({id : this.get('ID')});
	},
	calcfilesize: function(bytes){
		var unit, index;
		unit = ["bytes", "KB", "MB", "GB"];
		index = 0;
		while (Math.floor(bytes).toString().length > 3){
			index++;
			bytes = parseInt(bytes, 10);
			bytes = bytes / 1024;
		}

		if (Math.round(bytes) !== bytes) {
			bytes = parseFloat(bytes, 10).toFixed(2).toString().slice(0,6);
		}
		return  bytes + " " + unit[index];
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
	},
	filepath: function(){
		return this.simpleinfo.name;
	}
});
/*
ANNOUCEMENTS
*/
m.Announcement = Backbone.Model.extend({});
m.Announcements = Backbone.Collection.extend({
	initialize: function(options){
		this.loaded = false;
	},
	model: m.Announcement,
	isloading: function(){
		return !this.loaded;
	},
	isloaded: function(){
		this.loaded = true;
	}
});
/*
FORUM
*/
m.Forum = Backbone.Model.extend({

});
/*
MAIN
*/
m.Module = Backbone.Model.extend({
	initialize: function(options){
		_.bindAll(this, 'fetchworkbin','thinfolder');
		this.workbin = new m.Workbin(this.get('workbin'));
		this.workbin.setname(this.get("code"));
		this.announcements = new m.Announcements(this.get('announcements'));
	},
	thinfiles: function(filearray){
		return _.map(filearray.reverse(), function(file){
			var y = {};
			y.FileDescription = file.FileDescription;
			y.FileName = file.FileName;
			y.FileSize = file.FileSize;
			y.FileType = file.FileType;
			y.ID = file.ID;
			y.dled = file.isDownloaded ? 1 : 0;
			return y;
		});
	},
	thinfolder: function(folderarray){
		return _.map(folderarray, function(folder){
			var y = {};
			y.FolderName = folder.FolderName;
			y.FileCount = folder.FileCount;
			y.Files = this.thinfiles(folder.Files);
			y.Folders = this.thinfolder(folder.Folders);
			y.ID = folder.ID;
			return y;
		}, this);
	},
	fetchworkbin: function(){
		var that = this;
		this.user.workbin(this.id, function(data){
			//check if all is good.
			if (data.Results.length === 0) {
				data.Results[0] = {};
			}

			//save space.
			var relevant = {};
			relevant.Folders = that.thinfolder(data.Results[0].Folders);
			relevant.ID = data.Results[0].ID || -1;
			relevant.Title = data.Results[0].Title;
			
			//assign relevant to workbin.
			var workbin = relevant;
			that.workbin.set(relevant);

			//save state
			$.ajax({
				type: 'POST',
				url: "/workbin",
				data: {moduleid : that.id, workbin: workbin},
				success: function(data){
					//console.log(data);
				},
				dataType: 'json'
			});
		});
		return this;
	},
	nicedate: function(date){
		var datere = /^(\d\d\d\d)-(\d\d)-(\d\d)T(\d\d:\d\d):\d\d$/;
		var res = datere.exec(date);
		var str = res[3] + "/" + res[2] + " " + res[4];
		return str;
	},
	fetchannouncements: function(){
		var that = this;
		this.user.announcements(this.id, function(data){
			var announcements = _.map(data.Results, function(x){
				var announcement = {};
				announcement.id = x.ID;
				announcement.title = x.Title;
				announcement.date = that.nicedate(x.CreatedDate);
				announcement.contents = x.Description;
				announcement.from = x.Creator.Name;
				return announcement;
			},that);
			that.announcements.isloaded();
			that.announcements.add(announcements,{silent: true});
			that.announcements.trigger('change');
		});
		return this;
	},
	fetchforumheadings: function(){
		var that = this;
		this.user.forumheadings(this.id, function(data){
			console.log(data);
			if (data.Results.length === 0) {
				data.Results[0] = {};
			}

			//extract relevant data
			var forum = {};
			forum.id = data.Results[0].ID || -1;
			forum.Headings = that.thinheadings(data.Results[0].Headings);

		});
		return this;
	},
	thinheadings: function(headings){
		return _.map(headings, function(heading){
			var x = {};
			x.id = heading.ID;
			x.title = heading.Title;
			x.order = heading.HeadingOrder;
			return x;
		});
	}
});
m.Modules = Backbone.Collection.extend({
	initialize: function(models, options){
		this.user = options.user;
		_.bindAll(this, 'fetch', 'update');
	},
	model: m.Module,
	fetch: function(callback){
		var that = this;
		this.user.modules(function(data){
			//save space.
			var modules = _.map(data.Results, function(mod){
				//keep relevant variables
				var relevant = {};
				relevant.code = mod.CourseCode;
				relevant.name = mod.CourseName;
				relevant.sem = mod.CourseSemester;
				relevant.year = mod.CourseAcadYear;
				relevant.id = mod.ID;
				return relevant;
			});

			that.reset(modules);
			callback();

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
			if (data.Comments === "Invalid login!"){
				//handle error.
			}
			var changes = _.filter(data.Results,function(module){
				return ! that.get(module.ID);
			},that);

			//remove inactive modules
			var activemodule = function(module){
				return _.find(data.Results, function(mod){
					return module.id === mod.ID;
				});
			};
			_.each(that.models, function(module){
				if (!activemodule(module)){
					that.remove(module);
				}
			},that);
			
			if (changes.length > 0){
				var modules = _.map(changes, function(module){
					var x = new m.Module(module);
					x.user = that.user;
					return x;
				}, that);
	
				that.add(modules);
				
				//save space.
				modules = _.map(data.Results, function(mod){
					//keep relevant variables
					var relevant = {};
					relevant.CourseCode = mod.CourseCode;
					relevant.CourseName = mod.CourseName;
					relevant.CourseSemester = mod.CourseSemester;
					relevant.CourseAcadYear = mod.CourseAcadYear;
					relevant.ID = mod.ID;
					return relevant;
				});

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
			}
		});
	}
});
return m;
});


