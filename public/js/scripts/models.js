/*global define:true */
define(['jquery', 'underscore', 'backbone'],
function($,_,Backbone){
	
var m = {};
/*
UTIL
*/
var relativeTime = {
	future : "in %s",
	past : "%s ago",
	s : "a few seconds",
	m : "a minute",
	mm : "%d minutes",
	h : "an hour",
	hh : "%d hours",
	d : "a day",
	dd : "%d days",
	M : "a month",
	MM : "%d months",
	y : "a year",
	yy : "%d years"
};
m.readabledate = function(dateobj){
	var milliseconds = Date.now() - dateobj.getTime(),
		seconds = Math.round(Math.abs(milliseconds) / 1000),
		minutes = Math.round(seconds / 60),
		hours = Math.round(minutes / 60),
		days = Math.round(hours / 24),
		years = Math.round(days / 365),
		
		args =	seconds < 45 && "a few seconds" ||
				minutes === 1 && "a minute" ||
				minutes < 45 && minutes + " minutes" ||
				hours === 1 && "an hour" ||
				hours < 22 && hours + " hours" ||
				days === 1 && "a day" ||
				days <= 25 && days + " days" ||
				days <= 45 && "a month" ||
				days < 345 && Math.round(days / 30) + " months" ||
				years === 1 && "a year" || years + " years";
	return args + " ago";
};
m.nicedate = function(date){
	var parts = date.match(/(\d+)/g);
	var dateobj = new Date(parts[0], parts[1]-1, parts[2], parts[3], parts[4], parts[5]);
	return dateobj;
};
/*
WORKBIN
*/
m.Items = Backbone.Collection.extend({});
m.Folder = Backbone.Model.extend({
	initialize: function(attr, parent){
		//link to parent folder
		this.parent = parent;
		this.set({"path": this.get("name")});
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
	defaults: {
		"filetype": ""
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
	getlatest: function(){
		var x = this.toJSON();
		x.files = [];
		x.folders = [];
		_.each(this.items.models, function(item) {
			if (item.get("type") === "document") {
				x.files.push(item.toJSON());
			} else if (item.get("type") === "folder") {
				x.folders.push(item.getlatest());
			}
		});
		return x;
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
		var x = _.filter(this.items.models, function(item){
			if (item.get("type") === 'document'){
				//issues with json (to fix)
				return item.isnotdled();
			} else if (item.get("type") === 'folder'){
				return item.hasnewfiles();
			}
		}, this);
		return x.length;
	}
});
m.File = Backbone.Model.extend({
	initialize: function(attr, parent){
		//link to parent folder
		this.parent = parent;
		this.set({size: this.calcfilesize(this.get('bytes'))});
		this.set({kind: this.get("filetype") + " document"});
	},
	defaults: {
		"filetype": ""
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
	},
	dled: function(){
		this.set({"dled" : "true"});
		var workbin = this.parent;
		while(workbin.parent){
			workbin = workbin.parent;
		}
		workbin.updateserver();
	},
	isnotdled: function(){
		return !this.get('dled') || this.get('dled') === "false";
	}
});
m.Workbin = Backbone.Model.extend({
	initialize: function(){
		this.type = "workbin";
		this.fields();
		this.on('change', this.fields, this);
		_.bindAll(this, "updateserver");
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
	},
	updateserver: function(){
		var workbin = this.toJSON();
		workbin.folders = _.map(this.items.models, function(item){
			return item.getlatest();
		});
		//save state
		$.ajax({
			type: 'POST',
			url: "/workbin",
			data: {
				moduleid : this.get("modid"),
				workbin: JSON.stringify(workbin)
			},
			success: function(data){
				//console.log(data);
			},
			dataType: 'json'
		});
	}
});
/*
ANNOUCEMENTS
*/
m.Announcement = Backbone.Model.extend({
	initialize: function(options){
		this.set({"path": this.id});
		//check date.
		if (this.get("date")){
			this.set({"nicedate": m.readabledate(this.get("date"))});
		}
		//update when necessary.
		//TODO
	}
});
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
		this.set({"path": this.id});
		this.parent = options.parent;
		this.user = options.user;
		this.type = "thread";
		this.threads = [];
		if (this.get("threads")){
			this.setthreads(this.get("threads"));
		}
			
		var date = this.get("date");
		if (typeof date === "string"){
			date = m.nicedate(date);
		}
		this.set({"nicedate": m.readabledate(date)});
		this.loaded = false;
		//update when necessary.
		//TODO
	},
	isloading: function(){
		return !this.loaded;
	},
	isloaded: function(){
		this.loaded = true;
	},
	fetch: function(){
		var that = this;
		this.user.forumthread(this.id, function(data){
			var thread = data.Results.length !== 0 ? data.Results[0] : null;
			thread = that.thinthread(thread);
			that.setthreads(thread.threads);
			that.isloaded();
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
			threads: _.map(thread.Threads.reverse(), function(thread){
				return this.thinthread(thread);
			},this)
		};
	}
});
m.Threads = Backbone.Collection.extend({
	initialize: function(models){
		this.loaded = models.length === 0 ? false : true;
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
		var threads = [];
		if (this.get("threads")){
			_.each(this.get("threads"), function(thread){
				var x = new m.Thread(thread, {parent: this, user: this.user});
				threads.push(x);
			}, this);
		}
		this.threads = new m.Threads(threads);
		this.set({"path": this.get("name")});
	},
	update: function(){
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
			that.updateserver();
		});
	},
	updateserver: function(){
		//save state
		$.ajax({
			type: 'POST',
			url: "/forum/heading",
			data: {
				moduleid : this.parent.get("modid"),
				headingid: this.id,
				threads: JSON.stringify(this.threads.toJSON())
			},
			success: function(data){
				// console.log(data);
			},
			dataType: 'json'
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
	},
	updateserver: function(){
		//save state
		$.ajax({
			type: 'POST',
			url: "/forum",
			data: {
				moduleid : this.get("modid"),
				forum: JSON.stringify(this.toJSON())
			},
			success: function(data){
				//console.log(data);
			},
			dataType: 'json'
		});
	}
});
/*
MAIN
*/
m.Module = Backbone.Model.extend({
	initialize: function(model, options){
		this.user = options.user;
		this.workbin = new m.Workbin(this.get('workbin'));
		this.workbin.setname(this.get("code"));
		this.announcements = new m.Announcements(this.get('announcements'));
		this.forum = new m.Forum(this.get('forum'), {user: this.user});
		_.bindAll(this, 'fetchworkbin','thinfolder','fetchannouncements');
	},
	//to prevent zeptojs ajax post method from triggering the same error again.
	defaults: {
		id: ""
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
			y.dled = file.isDownloaded ? true : false;
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
			relevant.modid = that.id;
			relevant.id = data.Results[0].ID || -1;
			relevant.type = relevant.kind = "folder";
			relevant.title = data.Results[0].Title;
			that.workbin.set(relevant);
			that.workbin.updateserver();
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
				modid: that.id,
				title: result.Title,
				headings: that.thinheadings(result.Headings)
			};
			that.forum.update(forum);
			that.forum.updateserver();
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
				data: {
					modules : JSON.stringify(modules)
				},
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