/*global define:true */
define(['jquery', 'underscore', 'backbone'],
function($,_,Backbone){
	
var m = {};
/*
UTIL
*/
m.nicedate = function(date){
	var datere = /^(\d\d\d\d)-(\d\d)-(\d\d)T(\d\d:\d\d):\d\d/;
	var res = datere.exec(date);
	var str = res[3] + "/" + res[2] + " " + res[4];
	return str;
};
/*
WORKBIN
*/
m.Items = Backbone.Collection.extend({});
m.Folder = Backbone.Model.extend({
	initialize: function(attr, parent){
		//link to parent folder
		this.parent = parent;
		var count = this.get('count');
		if (this.get('folders')) {
			count = parseInt(count, 10) + this.get('folders').length;
		}
		if (count === 0){
			this.set({size: "empty"});
		} else {
			this.set({size: count+ " items"});
		}
		this.init();
	},
	init: function(){
		var files = _.map(this.get('files'), function(file){
			return new m.File(file, this);
		}, this);
		var folders = _.map(this.get('folders'), function(folder){
			return new m.Folder(folder, this);
		}, this);

		this.items = new m.Items();
		this.items.add(folders);
		this.items.add(files);
	},
	filepath: function(){
		var path = "";
		var current = this.parent;
		while (current) {
			path = current.get("name") + "/" + path;
			current = current.parent;
		}

		return path + current.get("name");
	},
	hasnewfiles: function(){
		var x = _.find(this.items.models, function(item){
			if (item.type === 'document'){
				return item.get('dled') === 0;
			} else if (item.get("type") === 'folder'){
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
		this.set({size: this.calcfilesize(this.get('bytes'))});
		this.set({kind: this.get("filetype") + " document"});
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
		this.type = "workbin";
		this.fields();
		this.on('change', this.fields, this);
	},
	fields: function(){
		var x = _.map(this.get('folders'), function(folder){
			return new m.Folder(folder, this);
		},this);
		this.items = new m.Items(x);
	},
	setname: function(name){
		this.set({name: name});
	},
	filepath: function(){
		return this.get("name");
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
m.Thread = Backbone.Model.extend({
	initialize: function(model, options){
		_.bindAll(this, "setthreads", "fetch", "thinthread");
		this.parent = options.parent;
		this.user = options.user;
		this.type = "thread";
		this.threads = [];
		if (this.get("threads")){
			this.setthreads(this.get("threads"));
		}
	},
	fetch: function(){
		var that = this;
		this.user.forumthread(this.id, function(data){
			var thread = data.Results.length !== 0 ? data.Results[0] : null;
			thread = that.thinthread(thread);
			that.setthreads(thread.threads);
			that.trigger("reset");
		});
	},
	setthreads: function(threads){
		threads = _.map(threads, function(thread){
			var x = new m.Thread(thread, {parent: this, user: this.user});
			return x;
		}, this);
		this.threads = threads;
	},
	thinthread: function(thread){
		if (!thread) {
			return;
		}
		return {
			id: thread.ID,
			name: thread.PostTitle,
			author: thread.Poster.Name,
			email: thread.Poster.Email,
			uid: thread.Poster.UserID,
			body: thread.PostBody,
			date: m.nicedate(thread.PostDate_js),
			threads: _.map(thread.Threads, function(thread){
				return this.thinthread(thread);
			},this)
		};
	}
});
m.Threads = Backbone.Collection.extend({
	initialize: function(){
		this.loaded = false;
	},
	model: m.Thread,
	isloading: function(){
		return !this.loaded;
	},
	isloaded: function(){
		this.loaded = true;
	}
});
m.Heading = Backbone.Model.extend({
	initialize: function(model, options){
		this.type = "heading";
		this.parent = options.parent;
		this.user = options.user;
		this.threads = new m.Threads();
		var that = this;
		this.user.forumheadingthreads(this.id, function(data){
			var threads = _.map(data.Results, function(thread){
				return {
					id: thread.ID,
					name: thread.PostTitle,
					author: thread.Poster.Name,
					email: thread.Poster.Email,
					uid: thread.Poster.UserID,
					body: thread.PostBody,
					date: m.nicedate(thread.PostDate_js)
				};
			});
			
			_.each(threads, function(thread){
				var x = new m.Thread(thread, {parent: this, user: that.user});
				that.threads.add(x, {silent: true});
			}, that);
			that.threads.isloaded();
			that.threads.trigger("reset");
		});
	}
});
m.Headings = Backbone.Collection.extend({
	initialize: function(models){
		this.loaded = models.length === 0 ? false : true;
	},
	model: m.Heading,
	isloading: function(){
		return !this.loaded;
	},
	isloaded: function(){
		this.loaded = true;
	}
});
m.Forum = Backbone.Model.extend({
	initialize: function(model, options){
		this.type = "forum";
		this.user = options.user;
		var headings = [];
		if (this.get("headings")){
			_.each(this.get("headings"), function(heading){
				var x = new m.Heading(heading, {parent: this, user: this.user});
				headings.push(x);
			}, this);
		}
		this.headings = new m.Headings(headings);
		_.bindAll(this ,"update");
	},
	update: function(obj){
		this.set(obj);
		_.each(obj.headings, function(heading){
			var x = new m.Heading(heading, {parent: this, user: this.user});
			this.headings.add(x, {silent: true});
		}, this);
		this.headings.isloaded();
		this.headings.trigger("reset");
	}
});
/*
MAIN
*/
m.Module = Backbone.Model.extend({
	initialize: function(model, options){
		this.user = options.user;
		_.bindAll(this, 'fetchworkbin','thinfolder','fetchannouncements');
		this.workbin = new m.Workbin(this.get('workbin'));
		this.workbin.setname(this.get("code"));
		this.announcements = new m.Announcements(this.get('announcements'));
		this.forum = new m.Forum(this.get('forum'), {user: this.user});
	},
	thinfiles: function(filearray){
		return _.map(filearray.reverse(), function(file){
			var y = {};
			y.desc = file.FileDescription;
			y.name = file.FileName;
			y.bytes = file.FileSize;
			y.filetype = file.FileType;
			y.id = file.ID;
			y.type = "document";
			y.dled = file.isDownloaded ? 1 : 0;
			return y;
		});
	},
	thinfolder: function(folderarray){
		return _.map(folderarray, function(folder){
			var y = {};
			y.name = folder.FolderName;
			y.count = folder.FileCount;
			y.files = this.thinfiles(folder.Files);
			y.folders = this.thinfolder(folder.Folders);
			y.id = folder.ID;
			y.type = y.kind = "folder";
			return y;
		}, this);
	},
	thinheadings: function(headings){
		return _.map(headings, function(heading){
			return {
				id: heading.ID,
				name: heading.Title,
				order: heading.HeadingOrder
			};
		});
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
			relevant.folders = that.thinfolder(data.Results[0].Folders);
			relevant.id = data.Results[0].ID || -1;
			relevant.type = relevant.kind = "folder";
			relevant.title = data.Results[0].Title;
			that.workbin.set(relevant);

			//save state
			$.ajax({
				type: 'POST',
				url: "/workbin",
				data: {moduleid : that.id, workbin: relevant},
				success: function(data){
					//console.log(data);
				},
				dataType: 'json'
			});
		});
		return this;
	},
	fetchannouncements: function(){
		var that = this;
		this.user.announcements(this.id, function(data){
			var announcements = _.map(data.Results, function(x){
				var announcement = {};
				announcement.id = x.ID;
				announcement.title = x.Title;
				announcement.date = m.nicedate(x.CreatedDate_js);
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
	fetchforums: function(){
		var that = this;
		this.user.forums(this.id, function(data){
			//assume only one forum.
			var result = data.Results.length > 0 ? data.Results[0] : {};
			var forum = {
				id: result.ID,
				title: result.Title,
				headings: that.thinheadings(result.Headings)
			};
			that.forum.update(forum);

			//save state
			$.ajax({
				type: 'POST',
				url: "/forum",
				data: {moduleid : that.id, forum: forum},
				success: function(data){
					//console.log(data);
				},
				dataType: 'json'
			});
		});
		return this;
	}
});
m.Modules = Backbone.Collection.extend({
	initialize: function(models, options){
		this.user = options.user;
		_.bindAll(this, 'fetch');
	},
	model: m.Module,
	fetch: function(callback){
		var that = this;
		this.user.modules(function(data){
			//remove inactive modules
			var activemodule = function(module){
				return _.find(data.Results, function(mod){
					return module.id === mod.ID;
				});
			};
			_.each(that.models, function(module){
				if (!activemodule(module)){
					this.remove(module);
				}
			},that);

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

			//add those that dont exist. update those that do.
			_.each(modules, function(mod){
				var existing = this.get(mod.id);
				if (existing) {
					existing.set(mod, {silent: true});
				} else {
					var x = new m.Module(mod, {user: this.user});
					this.add(x, {silent: true});
				}
			},that);
			that.trigger("reset");
			if (callback) {
				callback();
			}

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
	}
});
return m;
});