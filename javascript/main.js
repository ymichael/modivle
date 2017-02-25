var React = require('react');
var $ = require('jquery');
var _ = require('underscore');
var history = require('html5-history');
var Sidebar = require('react-sidebar');
var Ivle = require('./ivle.js');
var utils = require('./utils.js');
var storage = require('./storage.js');


var App = React.createClass({
  getDefaultProps: function() {
    var authToken = storage.getToken();
    return {
      ivle: new Ivle(authToken)
    };
  },
  getInitialState: function() {
    return {
      modules: [],
      loading: true,
      activeModule: null,
      currentFolder: null,
      currentThread: null,
      currentView: "overview",

      // Sidebar state
      sidebarOpen: true,
      useSidebar: false
    };
  },
  logout: function() {
    storage.logout();
    utils.redirectToWelcomePage();
  },
  validateUser: function() {
    this.props.ivle.validate(function(data) {
      if (data.Success == false) {
        storage.logout();
        utils.redirectToWelcomePage();
      }
      storage.saveToken(data.Token);
    });
  },
  maybeReloadState: function() {
    // Check if state exists in localstorage.
    var state = storage.getState();
    if (!state) {
      this.updateModules();
    } else {
      modules = JSON.parse(state, function(k, v) {
        if (k == 'date') {
          return utils.nicedate(v);
        }
        return v;
      });
      _.each(modules, function(module) {
        if (module.forum) {
          Ivle.setParentForForum(module.forum);
        }
        if (module.workbin) {
          Ivle.setParentForFolders(module.workbin);
        }
      });
      // Workaround setState does not occur immediately.
      this.state.modules = modules;
      this.setState({modules: modules, loading: false});
      this.updateModules();
    }
  },
  parseCurrentUrl: function() {
    var fail = function() {
      history.pushState(null, null, "/");
      return;
    };
    if (!storage.getState()) {
      return fail();
    }

    var currentState = {};
    var urlState = history.getState();
    var hash = urlState.hash;
    var paths = hash.slice(hash.indexOf('?') + 1).split('/');
    if (paths.length == 0) {
      return fail();
    }
    // Try to match module.
    var moduleCode = paths[0];
    var module = _.find(this.state.modules, function(module) {
      return this.sanitizeUrl(module.code) == moduleCode;
    }, this);
    if (!module) {
      return fail();
    } else {
      currentState.activeModule = module;
      // Render sidebar in the closed state if a module has been selected.
      currentState.sidebarOpen = false;
    }
    // Try to match views.
    view = paths[1];
    if (['overview', 'announcements', 'forum', 'workbin'].indexOf(view) != -1) {
      currentState.currentView = view;
      if (paths.length == 2) {
        this.setState(currentState, this.updateForView);
        return;
      }
    } else {
      return fail();
    }

    if (view == 'forum') {
      if (!module.forum) {
        return fail();
      }
      var currentItem;
      var parentItem = module.forum;
      for (var i = 2; i < paths.length; i++) {
        currentItem = _.find(parentItem.children, function(item) {
          return this.sanitizeUrl(item.name) == paths[i];
        }, this);
        if (currentItem) {
          parentItem = currentItem;
        } else {
          return fail();
        }
      }
      currentState.currentThread = currentItem;
      this.setState(currentState, this.updateForView);
      return;
    }

    // Try to match workbin
    if (view == 'workbin') {
      if (!module.workbin) {
        return fail();
      }
      var currentItem;
      var parentItem = module.workbin;
      for (var i = 2; i < paths.length; i++) {
        currentItem = _.find(parentItem.folders, function(folder) {
          return this.sanitizeUrl(folder.name) == paths[i];
        }, this);
        if (currentItem) {
          parentItem = currentItem;
        } else {
          return fail();
        }
      }
      currentState.currentFolder = currentItem;
      this.setState(currentState, this.updateForView);
      return;
    }
    return fail();
  },
  componentWillMount: function() {
    this.bindMediaQueryChange();
    this.validateUser();
    this.maybeReloadState();
    this.parseCurrentUrl();
  },
  componentWillUnmount: function() {
    this.state.mql.removeListener(this.mediaQueryChanged);
  },
  onSetSidebarOpen: function(open) {
    this.setState({sidebarOpen: open});
  },
  bindMediaQueryChange: function() {
    var mql = window.matchMedia("(max-width: 960px)");
    mql.addListener(this.mediaQueryChanged);
    this.setState({mql: mql, useSidebar: mql.matches});
  },
  mediaQueryChanged: function() {
    this.setState({useSidebar: this.state.mql.matches});
  },
  updateModules: function() {
    this.props.ivle.getModules(function(modules) {
      // Merge with existing modules.
      _.each(modules, function(module) {
        var existing = _.find(this.state.modules, function(x) {
          return x.id == module.id;
        });
        if (existing) {
          module.announcements = existing.announcements;
          module.workbin = existing.workbin;
          module.forum = existing.forum;
        }
      }, this);
      this.setState({modules: modules, loading: false}, this.stateUpdated);
    }.bind(this));
  },
  stateUpdated: function() {
    this.forceUpdate();
    var state = JSON.stringify(this.state.modules, function(k, v) {
      // Remove circular references
      if (k == 'parent') {
        return null;
      }
      return v;
    });
    storage.saveState(state);
  },
  sanitizeUrl: function(url) {
    return url.replace(/\//g, "-").replace(/ /g, "").toLowerCase();
  },
  updateUrl: function() {
    if (!this.state.activeModule) {
      history.pushState(null, null, "");
      return
    }
    extra = [];
    if (this.state.currentView == 'workbin' && this.state.currentFolder) {
      var currentFolder = this.state.currentFolder;
      while (currentFolder.parent) {
        extra.push(currentFolder.name);
        currentFolder = currentFolder.parent;
      }
      extra.reverse();
    } else if (this.state.currentView == 'forum' && this.state.currentThread) {
      var currentThread = this.state.currentThread;
      while (currentThread.parent) {
        extra.push(currentThread.name);
        currentThread = currentThread.parent;
      }
      extra.reverse();
    }
    path = _.union([this.state.activeModule.code, this.state.currentView], extra);
    path = _.map(path, this.sanitizeUrl);
    history.pushState(null, null, "?" + path.join('/'));
  },
  threadSelected: function(item) {
    this.setState({currentThread: item}, this.updateForView);
  },
  folderSelected: function(item) {
    this.setState({currentFolder: item}, this.updateUrl);
  },
  downloadFile: function(item) {
    this.props.ivle.downloadFile(item.id);
  },
  moduleSelected: function(e) {
    var moduleCode = e.target.textContent;
    var activeModule = _.find(this.state.modules, function(module) {
      return module.code == moduleCode;
    });
    this.setState({
      activeModule: activeModule,
      sidebarOpen: false,
      currentFolder: null,
      currentThread: null
    }, this.updateForView);
  },
  viewSelected: function(e) {
    var tab = e.target.textContent;
    this.setState({
      currentView: tab,
      currentFolder: null,
      currentThread: null
    }, this.updateForView);
  },
  updateForView: function() {
    this.updateUrl();

    if (!this.state.activeModule) {
      return;
    }

    if (this.state.currentView == "announcements") {
      this.props.ivle.getAnnouncements(
        this.state.activeModule.id,
        function(announcements) {
          this.state.activeModule.announcements = announcements;
          this.stateUpdated();
        }.bind(this));
    } else if (this.state.currentView == "overview") {
      this.props.ivle.getOverview(
        this.state.activeModule.id,
        function(overview) {
          this.state.activeModule.overview = overview;
          this.stateUpdated();
        }.bind(this));
    } else if (this.state.currentView == "workbin") {
      this.props.ivle.getWorkbin(
        this.state.activeModule.id,
        function(workbin) {
          Ivle.setParentForFolders(workbin);
          this.state.activeModule.workbin = workbin;
          this.stateUpdated();
        }.bind(this));
    } else if (this.state.currentView == "forum") {
      if (!this.state.currentThread) {
        this.props.ivle.getForums(
          this.state.activeModule.id,
          function(forum) {
            Ivle.setParentForForum(forum);
            this.state.activeModule.forum = forum;
            this.stateUpdated();
          }.bind(this));
      } else {
        if (this.state.currentThread.type == 'heading') {
          this.props.ivle.getForumHeadingThreads(
            this.state.currentThread.id,
            function(threads) {
              this.state.currentThread.children = threads || [];
              Ivle.setParentForForum(this.state.currentThread);
              this.stateUpdated();
            }.bind(this));
        } else if (this.state.currentThread.type == 'thread') {
          this.props.ivle.getForumThread(
            this.state.currentThread.id,
            function(post) {
              this.state.currentThread.children = post.children || [];
              this.stateUpdated();
            }.bind(this));
        }
      }
    }
  },
  render: function() {
    var overlay = this.state.loading ? <OverlayView /> : "";
    var moduleView = <ModulesView
      modules={this.state.modules}
      activeModule={this.state.activeModule}
      moduleSelected={this.moduleSelected} />
    var contentView = <ContentView
      currentView={this.state.currentView}
      currentThread={this.state.currentThread}
      currentFolder={this.state.currentFolder}
      activeModule={this.state.activeModule}
      threadSelected={this.threadSelected}
      folderSelected={this.folderSelected}
      downloadFile={this.downloadFile}
      viewSelected={this.viewSelected} />
    var logoutIcon = <div onClick={this.logout} id="logout" title="logout"></div>
    var sidebarIcon = <a onClick={this.onSetSidebarOpen} id="hamburger">
        <span className="icon">=</span>
        <span className="text">
          {this.state.activeModule ? " " + this.state.activeModule.code : ""}
        </span>
      </a>

    var appView;
    if (this.state.useSidebar) {
      var mainContents = (
        <div>
          <header>
            <div id="header_container">
              {sidebarIcon}{logoutIcon}
            </div>
          </header>
          <div id="main">
            <div id="main_container">{contentView}</div>
          </div>
          <div className="push"></div>
        </div>
      );
      appView = <Sidebar
        open={this.state.sidebarOpen}
        onSetOpen={this.onSetSidebarOpen}
        sidebar={moduleView}>
        {mainContents}
      </Sidebar>
    } else {
      appView = (
        <div>
          <header>
            <div id="header_container">{logoutIcon}</div>
          </header>
          <div id="main">
            <div id="main_container">
              {moduleView}
              {contentView}
            </div>
          </div>
          <div className="push"></div>
        </div>
      );
    }
    return (
      <div>
        {overlay}
        {appView}
      </div>
    );
  }
});

var OverlayView = React.createClass({
  getInitialState: function() {
    return {dismissed: false};
  },
  dismiss: function() {
    this.setState({dismissed: true});
  },
  render: function() {
    if (this.state.dismissed) {
      return <div></div>;
    }
    return (
      <div id="overlay">
        <div className='modal message'>
          <div onClick={this.dismiss} id='overlay_close'></div>
          <span>Loading your modules, Please be patient...</span>
        </div>
      </div>
    );
  }
})

var ModulesView = React.createClass({
  render: function() {
    var modules = this.props.modules.map(function(module) {
      var active = this.props.activeModule &&
        module.code == this.props.activeModule.code ? "active" : "";
      return (
        <div key={module.code}
            className={'moduleview ' + active}
            onClick={this.props.moduleSelected}>
          <div className='modulecode'>{module.code}</div>
        </div>
      );
    }.bind(this));
    return (
      <div id="leftbar">{modules}</div>
    );
  }
});

var NavView = React.createClass({
  render: function() {
    var navs = _.map(['overview', 'announcements', 'workbin', 'forum'], function(tab) {
      var active = tab == this.props.currentView ? "active" : "";
      return <div key={tab} className={'tab ' + active}
        onClick={this.props.viewSelected}>{tab}</div>
    }.bind(this));
    return <div id='tabs'>{navs}</div>
  }
})

var ContentView = React.createClass({
  render: function() {
    if (!this.props.activeModule) {
      return (<div id="content"></div>);
    }
    var contents = "";
    if (this.props.activeModule) {
      if (this.props.currentView == 'workbin') {
        contents = <WorkbinView
          folderSelected={this.props.folderSelected}
          downloadFile={this.props.downloadFile}
          currentFolder={this.props.currentFolder}
          module={this.props.activeModule} />
      } else if (this.props.currentView == 'forum') {
        contents = <ForumView
          threadSelected={this.props.threadSelected}
          currentThread={this.props.currentThread}
          module={this.props.activeModule} />
      } else if (this.props.currentView == 'announcements') {
        contents = <AnnouncementsView module={this.props.activeModule} />
      } else if (this.props.currentView == 'overview') {
        contents = <OverviewView module={this.props.activeModule} />
      }
    }
    return (
      <div id="content">
        <NavView
          viewSelected={this.props.viewSelected}
          currentView={this.props.currentView} />
        <div id='tabcontent'>{contents}</div>
      </div>
    );
  }
});


/**
 * Announcements
 */
var AnnouncementView = React.createClass({
  render: function() {
    return (
      <div className="announcementview tabpost" key={this.props.id}>
        <div className='posttitle'>
          <div className='posttitlemain'>
            <span className='main'>{this.props.title}</span>
            <span className='dot'>&middot;</span>
            <span className='author'>{this.props.from}</span>
          </div>
          <span className='date'>{utils.readabledate(this.props.date)}</span>
        </div>
      <div className='postbody'dangerouslySetInnerHTML={{__html: this.props.contents}} />
      </div>
    );
  }
})

var AnnouncementsView = React.createClass({
  render: function() {
    var contents = "";
    if (!this.props.module.announcements) {
      contents = <div className='inforow tabrow'>loading...</div>
    } else {
      if (this.props.module.announcements.length == 0) {
        contents = <div className='inforow tabrow'>no announcements.</div> 
      } else {
        contents = this.props.module.announcements.map(function(announcement) {
          return <AnnouncementView {...announcement} />
        });
      }
    }
    return (
      <div className="announcementsview">{contents}</div>
    );
  }
});

/**
 * Overview
 */
var OverviewItemView = React.createClass({
  render: function() {
    return (
      <div className="overviewview tabpost" key={this.props.id}>
        <div className='posttitle'>
          <div className='posttitlemain'>
            <span className='main'>{this.props.title}</span>
          </div>
        </div>
      <div className='postbody'dangerouslySetInnerHTML={{__html: this.props.contents}} />
      </div>
    );
  }
})

var OverviewView = React.createClass({
  render: function() {
    var contents = "";
    if (!this.props.module.overview) {
      contents = <div className='inforow tabrow'>loading...</div>
    } else {
      if (this.props.module.overview.length == 0) {
        contents = <div className='inforow tabrow'>no overview.</div> 
      } else {
        contents = this.props.module.overview.map(function(overview) {
          return <OverviewItemView {...overview} />
        });
      }
    }
    return (
      <div className="overviewview">{contents}</div>
    );
  }
});


/**
 * Workbin
 */
var WorkbinView = React.createClass({
  render: function() {
    var contents = "";
    if (!this.props.module.workbin) {
      contents = <div className='folder'><span>loading...</span></div>
    } else {
      var currentFolder = this.props.currentFolder || this.props.module.workbin;
      var items = _.union(currentFolder.folders, currentFolder.files);
      if (items.length == 0) {
        contents = <div className='folder'><span>this folder is empty.</span></div>
      } else {
        contents = _.map(items, function(item) {
          if (item.type == 'document') {
            return <FileView downloadFile={this.props.downloadFile} file={item} />
          } else {
            return <FolderView folderSelected={this.props.folderSelected} folder={item} />
          }
        }, this);
      }
    }
    return (
      <div>
        <BreadcrumbsView
          itemSelected={this.props.folderSelected}
          currentItem={currentFolder}
          type='workbin' />
        <div className='tabrowinfo tabrow'>
          <div className='rowname'>
            <div className='rowicon'></div>
            <span>Name</span>
          </div>
          <div className='rowcol2'>Kind</div>
          <div className='rowcol3'>Size</div>
        </div>
        <div id='filescontainer'>{contents}</div>
      </div>
    );
  }
});

var FileView = React.createClass({
  getFiletype: function() {
    var fileTypes = {
      zip : "zip", doc : "doc", docx : "doc",
      pdf : "pdf", ppt : "ppt", pptx : "ppt",
      xls : "xls", xlsx : "xlsx", acc : "acc",
      avi : "avi", bmp : "bmp", c : "c", cpp : "cpp",
      dmg : "dmg", exe : "exe", flv : "flv",
      gif : "gif", h : "h", html : "html", ics : "ics",
      java : "java", jpg : "jpg", key : "key",
      mp3 : "mp3", mid : "mid", mp4 : "mp4",
      mpg : "mpg", php : "php", png : "png",
      psd : "psd", py : "py", qt : "qt",
      rar : "rar", rb : "rb", rtf :  "rtf",
      sql : "sql", tiff : "tiff", txt : "txt",
      wav : "wav", xml : "xml"
    };
    return _.has(fileTypes, this.props.file.filetype) ?
      fileTypes[this.props.file.filetype] : '_blank';
  },
  render: function() {
    var iconStyle = {
      backgroundImage: 'url(/build/images/filetypes/' + this.getFiletype() + '.png)'
    };
    return (
      <div onClick={this.props.downloadFile.bind(null, this.props.file)}
          className="tabrow itemview fileview">
        <div className='rowname'>
          <div className='rowicon' style={iconStyle}></div>
          <span>{this.props.file.name}</span>
        </div>
        <div className='rowcol2'>{this.props.file.kind}</div>
        <div className='rowcol3'>{this.props.file.size}</div>
      </div>
    );
  }
});

var FolderView = React.createClass({
  render: function() {
    return (
      <div onClick={this.props.folderSelected.bind(null, this.props.folder)}
          className="tabrow itemview folderview">
        <div className='rowname'>
          <div className={'rowicon ' + this.props.folder.filetype}></div>
          <span>{this.props.folder.name}</span>
        </div>
        <div className='rowcol2'>{this.props.folder.kind}</div>
        <div className='rowcol3'>{this.props.folder.size}</div>
      </div>
    )
  }
});

var BreadcrumbsView = React.createClass({
  render: function() {
    var contents = "";
    if (this.props.currentItem && this.props.currentItem.parent) {
      contents = [];
      if (this.props.currentItem.type == 'thread') {
        contents.push(
          <div className="breadcrumb current">
            <div className='arrow'></div><span>{this.props.currentItem.title}</span>
          </div>);
      } else {
        contents.push(
          <div className="breadcrumb current">
            <div className='arrow'></div><span>{this.props.currentItem.name}</span>
          </div>);
      }
      var currentItem = this.props.currentItem.parent;
      while (currentItem.parent) {
        contents.push(
          <div className="breadcrumb parent" onClick={this.props.itemSelected.bind(null, currentItem)}>
            <div className='arrow'></div><span>{currentItem.name}</span>
          </div>);
        currentItem = currentItem.parent;
      }
      contents.push(
        <div className="breadcrumb parent" onClick={this.props.itemSelected.bind(null, currentItem)}>
          <div className={'icon ' + currentItem.type + 'icon'}></div>
        </div>);
      contents.reverse();
    }
    return <div className='breadcrumbs tabheading' id={this.props.type + 'heading'}>{contents}</div>
  }
});


/**
 * Forum
 * (forum -> heading -> thread)
 */
var ForumView = React.createClass({
  render: function() {
    var contents = "";
    if (!this.props.module.forum) {
      contents = <div className='inforow tabrow'>loading...</div>
    } else {
      var currentThread = this.props.currentThread || this.props.module.forum;
      if (currentThread.type == 'forum' || currentThread.type == 'heading') {
        contents = <ForumItemsView
          threadSelected={this.props.threadSelected}
          currentItem={currentThread} />
      } else if (currentThread.type == 'thread') {
        contents = (
          <div id='forumsinglethreadview'>
            <ForumThreadView currentItem={currentThread} isRoot={true} />
          </div>
        );
      }
    }
    return (
      <div id='forumcontainer'>
        <BreadcrumbsView
          itemSelected={this.props.threadSelected}
          currentItem={currentThread}
          type='forum' />
        <div className='tabcontents'>{contents}</div>
      </div>
    );
  }
});

var ForumThreadView = React.createClass({
  render: function() {
    var end = "";
    var children = "";
    if (this.props.currentItem.children == null) {
      end = <div className='inforow tabrow'>loading...</div>
    } else {
      if (this.props.isRoot) {
        end = <div className='inforow tabrow'>end of thread.</div>
      }
      if (this.props.currentItem.children.length != 0) {
        children = this.props.currentItem.children.map(function(item) {
          return <ForumThreadView currentItem={item} isRoot={false} />
        });
      }
    }
    return (
      <div className='tabpost forumpost'>
        <div className='subthreadicon'></div>
        <div className='posttitle'>
          <div className='posttitlemain'>
          <span className='main'>{this.props.currentItem.title}</span>
          <span className='dot'>&middot;</span>
          <span className='author'>{this.props.currentItem.author}</span>
        </div>
        <span className='date'>{utils.readabledate(this.props.currentItem.date)}</span>
        </div>
        <div className='postbody' dangerouslySetInnerHTML={{__html: this.props.currentItem.body}} />
        <div id={this.props.currentItem.id} className='subthreads'>{children}</div>
        {end}
      </div>
    );
  }
});

var ForumItemsView = React.createClass({
  render: function() {
    var contents = "";
    if (this.props.currentItem.children == null) {
      contents = <div className='inforow tabrow'>loading...</div>
    } else if (this.props.currentItem.children.length == 0) {
      var childrenType = {
        'forum': 'headings',
        'heading': 'threads',
        'thread': 'posts'
      };
      contents = <div className='inforow tabrow'>zero {childrenType[this.props.currentItem.type]} :(</div>
    } else {
      var contents = this.props.currentItem.children.map(function(item) {
        if (item.type == 'thread') {
          return (
            <div key={item.id} className="tabrow itemview"
                onClick={this.props.threadSelected.bind(null, item)}>
              <div className='rowicon threadicon'></div>
              <div className='posttitle'>
                <div className='posttitlemain'>
                  <span className='main'>{item.title}</span>
                  <span className='dot'>&middot;</span>
                  <span className='author'>{item.author}</span>
                </div>
                <span className='date'>{utils.readabledate(item.date)}</span>
              </div>
            </div>
          );
        }
        return (
          <div key={item.id} className="tabrow itemview"
              onClick={this.props.threadSelected.bind(null, item)}>
            <div className='rowname'>
              <div className={'rowicon ' + item.type + 'icon'}></div>
              <span>{item.name}</span>
            </div>
            <div className='rowcol2'></div>
            <div className='rowcol3'></div>
          </div>
        );
      }, this);
    }

    return <div>{contents}</div>
  }
});


React.render(<App />, document.getElementById('container'));