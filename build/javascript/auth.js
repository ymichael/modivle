(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var storage = require("./storage.js");
var utils = require('./utils.js');

// http://stackoverflow.com/a/901144/1070617
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

(function() {
  storage.check();

  // Check for user token.
  var isLoggedIn = storage.isLoggedIn();
  var isWelcomePage = utils.isWelcomePage();
  if (!isLoggedIn && !isWelcomePage) {

    // Check for token
    var token = getParameterByName("token");
    if (token) {
      storage.saveToken(token);
      utils.redirectToMainPage();
      return; 
    } else {
      utils.redirectToWelcomePage();
      return;
    }
  }

  if (isLoggedIn && isWelcomePage) {
    utils.redirectToMainPage();
    return; 
  }
})();

},{"./storage.js":2,"./utils.js":3}],2:[function(require,module,exports){
var store = require('store');

module.exports = {
  check: function() {
    // Make sure that localstorage works in the current browser.
    if (!store.enabled) {
      alert('Local storage is not supported by your browser. Please disable "Private Mode", or upgrade to a modern browser.');
      return;
    }
  },
  isLoggedIn: function() {
    return !!store.get('token');
  },
  getToken: function() {
    return store.get('token');
  },
  saveToken: function(token) {
    store.set('token', token);
  },
  logout: function() {
    store.clear();
  },
  saveState: function(state) {
    return store.set('state', state);
  },
  getState: function() {
    return store.get('state');
  }
}

},{"store":4}],3:[function(require,module,exports){
var nicedate = function(date){
  var parts = date.match(/(\d+)/g);
  var dateobj = new Date(parts[0], parts[1]-1, parts[2], parts[3], parts[4], parts[5]);
  return dateobj;
};


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

var readabledate = function(dateobj){
  var milliseconds = Date.now() - dateobj.getTime(),
    seconds = Math.round(Math.abs(milliseconds) / 1000),
    minutes = Math.round(seconds / 60),
    hours = Math.round(minutes / 60),
    days = Math.round(hours / 24),
    years = Math.round(days / 365),
    args =  seconds < 45 && "a few seconds" ||
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


var mainPage = "/";
var welcomePage = "/welcome.html";

var isWelcomePage = function() {
  return window.location.pathname == welcomePage;
};

var redirectToMainPage = function() {
  // Redirect to main page.
  var re = new RegExp("^(.+" + window.location.host+ ")");
  window.location.href = re.exec(window.location.href)[1] + mainPage;
};

var redirectToWelcomePage = function() {
  var re = new RegExp("^(.+" + window.location.host+ ")");
  window.location.href = re.exec(window.location.href)[1] + welcomePage;
};


var calcfilesize = function(bytes){
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
};


module.exports.nicedate = nicedate;
module.exports.readabledate = readabledate;
module.exports.isWelcomePage = isWelcomePage;
module.exports.redirectToWelcomePage = redirectToWelcomePage;
module.exports.redirectToMainPage = redirectToMainPage;
module.exports.calcfilesize = calcfilesize;

},{}],4:[function(require,module,exports){
;(function(win){
	var store = {},
		doc = win.document,
		localStorageName = 'localStorage',
		scriptTag = 'script',
		storage

	store.disabled = false
	store.version = '1.3.17'
	store.set = function(key, value) {}
	store.get = function(key, defaultVal) {}
	store.has = function(key) { return store.get(key) !== undefined }
	store.remove = function(key) {}
	store.clear = function() {}
	store.transact = function(key, defaultVal, transactionFn) {
		if (transactionFn == null) {
			transactionFn = defaultVal
			defaultVal = null
		}
		if (defaultVal == null) {
			defaultVal = {}
		}
		var val = store.get(key, defaultVal)
		transactionFn(val)
		store.set(key, val)
	}
	store.getAll = function() {}
	store.forEach = function() {}

	store.serialize = function(value) {
		return JSON.stringify(value)
	}
	store.deserialize = function(value) {
		if (typeof value != 'string') { return undefined }
		try { return JSON.parse(value) }
		catch(e) { return value || undefined }
	}

	// Functions to encapsulate questionable FireFox 3.6.13 behavior
	// when about.config::dom.storage.enabled === false
	// See https://github.com/marcuswestin/store.js/issues#issue/13
	function isLocalStorageNameSupported() {
		try { return (localStorageName in win && win[localStorageName]) }
		catch(err) { return false }
	}

	if (isLocalStorageNameSupported()) {
		storage = win[localStorageName]
		store.set = function(key, val) {
			if (val === undefined) { return store.remove(key) }
			storage.setItem(key, store.serialize(val))
			return val
		}
		store.get = function(key, defaultVal) {
			var val = store.deserialize(storage.getItem(key))
			return (val === undefined ? defaultVal : val)
		}
		store.remove = function(key) { storage.removeItem(key) }
		store.clear = function() { storage.clear() }
		store.getAll = function() {
			var ret = {}
			store.forEach(function(key, val) {
				ret[key] = val
			})
			return ret
		}
		store.forEach = function(callback) {
			for (var i=0; i<storage.length; i++) {
				var key = storage.key(i)
				callback(key, store.get(key))
			}
		}
	} else if (doc.documentElement.addBehavior) {
		var storageOwner,
			storageContainer
		// Since #userData storage applies only to specific paths, we need to
		// somehow link our data to a specific path.  We choose /favicon.ico
		// as a pretty safe option, since all browsers already make a request to
		// this URL anyway and being a 404 will not hurt us here.  We wrap an
		// iframe pointing to the favicon in an ActiveXObject(htmlfile) object
		// (see: http://msdn.microsoft.com/en-us/library/aa752574(v=VS.85).aspx)
		// since the iframe access rules appear to allow direct access and
		// manipulation of the document element, even for a 404 page.  This
		// document can be used instead of the current document (which would
		// have been limited to the current path) to perform #userData storage.
		try {
			storageContainer = new ActiveXObject('htmlfile')
			storageContainer.open()
			storageContainer.write('<'+scriptTag+'>document.w=window</'+scriptTag+'><iframe src="/favicon.ico"></iframe>')
			storageContainer.close()
			storageOwner = storageContainer.w.frames[0].document
			storage = storageOwner.createElement('div')
		} catch(e) {
			// somehow ActiveXObject instantiation failed (perhaps some special
			// security settings or otherwse), fall back to per-path storage
			storage = doc.createElement('div')
			storageOwner = doc.body
		}
		var withIEStorage = function(storeFunction) {
			return function() {
				var args = Array.prototype.slice.call(arguments, 0)
				args.unshift(storage)
				// See http://msdn.microsoft.com/en-us/library/ms531081(v=VS.85).aspx
				// and http://msdn.microsoft.com/en-us/library/ms531424(v=VS.85).aspx
				storageOwner.appendChild(storage)
				storage.addBehavior('#default#userData')
				storage.load(localStorageName)
				var result = storeFunction.apply(store, args)
				storageOwner.removeChild(storage)
				return result
			}
		}

		// In IE7, keys cannot start with a digit or contain certain chars.
		// See https://github.com/marcuswestin/store.js/issues/40
		// See https://github.com/marcuswestin/store.js/issues/83
		var forbiddenCharsRegex = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]", "g")
		function ieKeyFix(key) {
			return key.replace(/^d/, '___$&').replace(forbiddenCharsRegex, '___')
		}
		store.set = withIEStorage(function(storage, key, val) {
			key = ieKeyFix(key)
			if (val === undefined) { return store.remove(key) }
			storage.setAttribute(key, store.serialize(val))
			storage.save(localStorageName)
			return val
		})
		store.get = withIEStorage(function(storage, key, defaultVal) {
			key = ieKeyFix(key)
			var val = store.deserialize(storage.getAttribute(key))
			return (val === undefined ? defaultVal : val)
		})
		store.remove = withIEStorage(function(storage, key) {
			key = ieKeyFix(key)
			storage.removeAttribute(key)
			storage.save(localStorageName)
		})
		store.clear = withIEStorage(function(storage) {
			var attributes = storage.XMLDocument.documentElement.attributes
			storage.load(localStorageName)
			for (var i=0, attr; attr=attributes[i]; i++) {
				storage.removeAttribute(attr.name)
			}
			storage.save(localStorageName)
		})
		store.getAll = function(storage) {
			var ret = {}
			store.forEach(function(key, val) {
				ret[key] = val
			})
			return ret
		}
		store.forEach = withIEStorage(function(storage, callback) {
			var attributes = storage.XMLDocument.documentElement.attributes
			for (var i=0, attr; attr=attributes[i]; ++i) {
				callback(attr.name, store.deserialize(storage.getAttribute(attr.name)))
			}
		})
	}

	try {
		var testKey = '__storejs__'
		store.set(testKey, testKey)
		if (store.get(testKey) != testKey) { store.disabled = true }
		store.remove(testKey)
	} catch(e) {
		store.disabled = true
	}
	store.enabled = !store.disabled

	if (typeof module != 'undefined' && module.exports && this.module !== module) { module.exports = store }
	else if (typeof define === 'function' && define.amd) { define(store) }
	else { win.store = store }

})(Function('return this')());

},{}]},{},[1]);
