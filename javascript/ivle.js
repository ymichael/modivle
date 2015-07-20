var $ = require('jquery');
var _ = require('underscore');
var utils = require('./utils.js');


module.exports = Ivle


function Ivle(token) {
  this.token = token;
};

Ivle.API_KEY = "ba1ge5NQ9cl76KQNI1Suc";
Ivle.BASE_URL = "https://ivle.nus.edu.sg/api/Lapi.svc/";
// Ivle.BASE_URL = "http://localhost:9003/";


/**
 * Makes a JSONP request to the IVLE API.
 * @private
 */
Ivle.prototype.jsonP_ = function(endpoint, params, success, error) {
  $.ajax({
    type: 'GET',
    dataType: 'jsonp',
    data: _.extend({
      "APIKey" : Ivle.API_KEY,
      "AuthToken" : this.token,
      "output" : "json"}, params),
    contentType:"application/x-javascript",
    url: Ivle.BASE_URL + endpoint,
    xhrFields: {withCredentials: false},
    success: success,
    error: error || function(){ console.error(arguments); }
  });
};


Ivle.prototype.validate = function(callback) {
  this.jsonP_('Validate', {
    "Token" : this.token
  }, callback);
};


Ivle.prototype.getUid = function(callback) {
  this.jsonP_('UserID_Get', {
    "Token" : this.token
  }, callback);
};


Ivle.prototype.getUname = function(callback) {
  this.jsonP_('UserName_Get', {
    "Token" : this.token,
  }, callback);
};


Ivle.prototype.getModules = function(callback) {
  this.jsonP_('Modules', {
    "Duration" : 0,
    "IncludeAllInfo" : false
  }, function(data) {
    var modules = _.map(data.Results, function(result) {
      return {
        "code": result.CourseCode,
        "name": result.CourseName,
        "sem": result.CourseSemester,
        "year": result.CourseAcadYear,
        "id": result.ID
      };
    });
    callback(modules);
  });
};


Ivle.prototype.getAnnouncements = function(courseId, callback) {
  this.jsonP_('Announcements', {
      "CourseId" : courseId,
      "Duration" : 0,
      "TitleOnly" : false,
  }, function(data) {
    var announcements = _.map(data.Results, function(result) {
      return {
        'id': result.ID,
        'title': result.Title,
        'date': utils.nicedate(result.CreatedDate_js),
        'contents': result.Description,
        'from': result.Creator.Name
      };
    });
    callback(announcements);
  });
};


Ivle.setParentForFolders = function(parent) {
  _.each(parent.folders, function(child) {
    child.parent = parent;
    Ivle.setParentForFolders(child);
  });
};


Ivle.prototype.parseFolders_ = function(folders) {
  return _.map(folders, function(folder){
    var items = parseInt(folder.FileCount, 10) + folder.Folders.length;
    return {
      id: folder.ID,
      kind: "folder",
      type: "folder",
      name: folder.FolderName,
      count: folder.FileCount,
      folders: this.parseFolders_(folder.Folders),
      files: this.parseFiles_(folder.Files),
      size: items == 0 ? 'empty' : items + ' items'
    };
  }.bind(this));
};


Ivle.prototype.parseFiles_ = function(files) {
  return _.map(files.reverse(), function(file){
    return {
      id: file.ID,
      name: file.FileName,
      desc: file.FileDescription,
      bytes: file.FileSize,
      filetype: file.FileType,
      type: "document",
      kind: file.FileType + ' document',
      size: utils.calcfilesize(file.FileSize),
      dled: !!file.isDownloaded
    };
  });
};


Ivle.prototype.getWorkbin = function(courseId, callback) {
  this.jsonP_('Workbins', {
      "CourseId" : courseId,
      "Duration" : 0,
      "TitleOnly" : false,
  }, function(data) {
    // Handle case where there is no workbin.
    if (data.Results.length == 0) data.Results[0] = {};
    var workbins = _.map(data.Results, function(result) {
      return {
        id: result.ID || -1,
        name: result.Title,
        title: result.Title,
        type: "workbin",
        kind: "workbin",
        folders: this.parseFolders_(result.Folders)
      };
    }, this);
    // TODO: Currenly only support single workbin.
    callback(workbins[0]);
  }.bind(this));
};


Ivle.prototype.downloadFile = function(fileId) {
  var url = "https://ivle.nus.edu.sg/api/downloadfile.ashx?APIKey=" +
    Ivle.API_KEY + "&AuthToken=" + this.token + "&ID=" + fileId + "&target=workbin";
  window.location.href = url;
};


Ivle.prototype.parseHeadings_ = function(headings) {
  return _.map(headings, function(heading){
    return {
      id: heading.ID,
      type: 'heading',
      name: heading.Title,
      order: heading.HeadingOrder
    };
  });
};


Ivle.prototype.getForums = function(courseId, callback) {
  this.jsonP_('Forums', {
    "CourseId" : courseId,
    "Duration" : 0,
    "IncludeThreads" : false,
    "TitleOnly" : false
  }, function(data) {
    var forums = _.map(data.Results, function(result) {
      return {
        id: result.ID,
        title: result.Title,
        name: result.Title,
        type: 'forum',
        children: this.parseHeadings_(result.Headings)
      };
    }, this);

    // Handle multiple forums here.
    if (forums.length > 1) {
      callback({
        type: 'forum',
        children: forums
      });
    } else {
      callback(forums[0]);
    }
  }.bind(this));
};

Ivle.setParentForForum = function(parent) {
  _.each(parent.children, function(child) {
    child.parent = parent;
    Ivle.setParentForForum(child);
  });
};

Ivle.prototype.getForumHeadingThreads = function(headingId, callback) {
  this.jsonP_('Forum_HeadingThreads', {
    "HeadingID" : headingId,
    "Duration" : 0,
    "GetMainTopicsOnly" : true
  }, function(data) {
    var threads = _.map(data.Results, function(result) {
      return {
        id: result.ID,
        name: result.ID,
        type: 'thread',
        title: result.PostTitle,
        author: result.Poster.Name,
        email: result.Poster.Email,
        uid: result.Poster.UserID,
        body: result.PostBody,
        date: utils.nicedate(result.PostDate_js)
      };
    });
    callback(threads);
  });
};


Ivle.prototype.parsePosts_ = function(posts) {
  if (!posts) {
    return;
  }
  return _.map(posts, function(post) {
    return {
      id: post.ID,
      name: post.ID,
      type: 'thread',
      title: post.PostTitle,
      author: post.Poster.Name,
      email: post.Poster.Email,
      uid: post.Poster.UserID,
      body: post.PostBody,
      date: utils.nicedate(post.PostDate_js),
      children: this.parsePosts_(post.Threads.reverse())
    };
  }, this);
};

Ivle.prototype.getForumThread = function(threadId, callback) {
  this.jsonP_('Forum_Threads', {
    "ThreadID": threadId,
    "GetSubThreads": true,
    "Duration": 0
  }, function(data) {
    callback(this.parsePosts_(data.Results)[0]);
  }.bind(this));
};