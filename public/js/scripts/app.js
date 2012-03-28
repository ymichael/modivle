define([
	  'jquery'
	, 'underscore'
	, 'backbone'
	, 'ich'
	// , 'appmodels'
	// , 'appviews'
	, 'text!templates/template.html'
], 
function($,_,Backbone, ich, templates){
$('body').append(templates);
ich.grabTemplates();

MapApp = Backbone.View.extend({
	el: "#container",
	initialize: function(){
		this.activepins = [];
		this.MapPinOverlay = {};
		this.collection = new MapObjects();
		_.bindAll(this, 'init', 'showmap','updatecollection','clumping','fullupdatecollection');
		this.collection.on('reset', this.renderpins, this);
		this.collection.on('add', this.addpin, this);

		//resize #main_container
		var resize = function(){
			this.$('#main_container').height($(window).height() - 40);
		}
		resize();
		var lazyresize = _.debounce(resize, 300);
		$(window).resize(lazyresize);
	},
	init: function(){
		if (!navigator.geolocation) alert("i'm sorry, but geolocation services are not supported by your browser");
		var that = this;
		navigator.geolocation.getCurrentPosition(function(position){
			var lat = position.coords.latitude;
			var lng = position.coords.longitude;
			that.showmap(lat, lng);
			
			//update collection;
			that.collection.setlocation(lat, lng);
			that.collection.fetch();
		}, function(err){
			if (err.code == 1){
				alert("You need to enable geolocation services to use this site");
			} else {
				alert("An error occured. Please try again");
			}

		});
	},
	updatecollection: function(lat, lng){
		this.collection.setlocation(lat, lng);
		var mapbounds = this.map.getBounds();
		_.each(this.activepins, function(pin){
			if (this.clumping(pin.data.sw.x, pin.data.ne.y, pin)){
				pin.setMap();
			}
		},this);
		this.collection.fetch();
	},
	fullupdatecollection: function(lat, lng){
		this.collection.setlocation(lat, lng);
		var mapbounds = this.map.getBounds();
		this.activepins = _.filter(this.activepins, function(pin){
			return mapbounds.contains(pin.data.swBound);
		},this);
		_.each(this.activepins, function(pin){
			if (this.clumping(pin.data.sw.x, pin.data.ne.y, pin)){
				pin.setMap();
			}
		},this);
		this.collection.fetch();
	},
	clumping: function(x,y, obj){
		if (obj){
			var conflict = _.any(_.without(this.activepins, obj), function(pin){
				return x < pin.data.sw.x + 40 && x > pin.data.sw.x - 40 && y < pin.data.ne.y + 40 && y > pin.data.ne.y - 40;
			}, this);
			return conflict;
		}
		var conflict = _.any(_.without(this.activepins, obj), function(pin){
			return x < pin.data.sw.x + 40 && x > pin.data.sw.x - 40 && y < pin.data.ne.y + 40 && y > pin.data.ne.y - 40;
		}, this);
		return conflict;
	},
	showmap: function(lat, lng){
		var that = this;
		var mapoptions = {
	 		center: new google.maps.LatLng(lat, lng),
	  		zoom: 15,
	  		disableDefaultUI: true,
	  		//scrollwheel: false,
	  		mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		this.map = new google.maps.Map(this.$("#map_canvas")[0], mapoptions);

		// $(window).resize(function(){
		// 	setTimeout(function(){
		// 		google.maps.event.trigger(that.map, 'resize');
		// 	}, 200);
		// });

		//map events
		var lazyload = _.debounce(that.updatecollection, 500);
		var fulllazyload = _.debounce(that.fullupdatecollection, 500);
		google.maps.event.addListener(this.map, 'drag', function() {
			var lat = that.map.getCenter().lat();
			var lng = that.map.getCenter().lng();
			lazyload(lat,lng);
		});

		google.maps.event.addListener(this.map, 'zoom_changed', function(e) {
			var lat = that.map.getCenter().lat();
			var lng = that.map.getCenter().lng();
			fulllazyload(lat,lng);
		});

		this.MapPinOverlay = function(parent, mapobject, map){
			this.parent = parent;
			this.view = new MapPin({model: mapobject});
			this.data = {}
			this.data.swBound = new google.maps.LatLng(mapobject.lat, mapobject.lng);
			this.data.neBound = new google.maps.LatLng(mapobject.lat, mapobject.lng);
			this.bounds_ = new google.maps.LatLngBounds(this.data.swBound, this.data.neBound);
			this.setMap(map);
		};
		this.MapPinOverlay.prototype = new google.maps.OverlayView();
		this.MapPinOverlay.prototype.onAdd = function(){
			this.div_ = this.view.render().el;
			var panes = this.getPanes();
			panes.overlayLayer.appendChild(this.div_)
		};
		this.MapPinOverlay.prototype.draw = function(){
		  var overlayProjection = this.getProjection();
		  this.data.sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
		  this.data.ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());

		  // Resize the image's DIV to fit the indicated dimensions.
		  if (_.include(that.activepins, this) || !that.clumping(this.data.sw.x, this.data.ne.y)){
		  	that.activepins.push(this);
			var div = this.div_;
			div.style.left = this.data.sw.x - $(div).width()/2 + 'px';
			div.style.top = this.data.ne.y - $(div).height() + 5 + 'px';
		  } else {
		  	this.setMap();
		  }
		};
		this.MapPinOverlay.prototype.onRemove = function() {
		  this.div_.parentNode.removeChild(this.div_);
		  this.div_ = null;

		  //clean up
		  that.activepins = _.without(that.activepins, this);
		  this.view.off();
		}
		this.renderpins();
	},
	renderpins: function(){
		this.pins = [];
		_.each(this.collection.models, function(model){
			var x = new this.MapPinOverlay(this, model, this.map);
			this.pins.push(x);
		},this);
	},
	addpin: function(pin){
		var x = new this.MapPinOverlay(this, pin, this.map);
	}
});

MapPin = Backbone.View.extend({
	className: "mappin",
	initialize: function(){
	},
	render: function(){
		this.$el.html(ich.mappin(this.model.display()));
		this.$el.addClass(this.model.get('type'));
		return this;
	},
	events : {
		"click" : 'test'
	},
	test: function(){
		console.log(this.model.attributes);
	}
});

MapObjectInstagram = Backbone.Model.extend({
	initialize: function(){
		this.set({type: 'instagram'});
		var location = this.get('location');
		this.lat = location.latitude;
		this.lng = location.longitude;
	},
	display: function(){
		var display = {};
		display.imagepath = this.get('images').thumbnail.url;
		display.type = this.get('type');

		return display;
	}
});

MapObjectfoursquare = Backbone.Model.extend({
	initialize: function(){
		this.set({type: 'foursquare'});
		this.lat = this.get('venue').location.lat;
		this.lng = this.get('venue').location.lng;
		//this.imagepath = this.get('tips')[0].user.photo;
	},
	display: function(){
		var display = {};
		if (this.get('tips')){
			display.imagepath = this.get('tips')[0].user.photo;	
		} else {
			var base = this.get('venue').categories[0].icon;
			display.imagepath = "";
		}
		display.type = this.get('type');
		return display;
	}
});

MapObjectsfoursquare = Backbone.Collection.extend({
	initialize: function(models, parent){
		this.parent = parent;
		this.clientid = 'QKNGKH2ZKJWVV2LZVSURSJOQ150ZWSDCI3D5E4RPLUPRSKWL';
		this.clientsecret = 'TJCGJLBEFI2V3SJHMKZPMSNLTMKMWV2IO5ZQY4IE53MKYMZM';
		this.on('reset', this.addall, this);
		this.on('add', this.addone, this);
	},
	addone: function(model){
		this.parent.add(model);
	},
	addall: function(){
		this.parent.add(this.models);
	},
	url: function(){
		var urlbase = "https://api.foursquare.com/v2/venues/explore?";
		var ll = "ll=" + this.lat + "," + this.lng;
		var auth = "&client_id=" + this.clientid + "&client_secret=" + this.clientsecret;
		var end = "&v=20120310";

		return urlbase + ll + auth + end;
	},
	parse: function(response){
		return _.filter(response.response.groups[0].items, function(model){
        	return !this.get(model.id);
        }, this);
	},
	sync: function(method, model, options) {
        var params = _.extend({
            type: 'GET',
            dataType: 'jsonp',
            url: model.url(),
            processData: false
        }, options);

        return $.ajax(params);
    },
	model: MapObjectfoursquare
});

MapObjectsInstagram = Backbone.Collection.extend({ 
	initialize: function(models,parent){
		this.parent = parent;
		this.clientid = "74c83ad91fc74a36871f29e0c19a8aed";

		this.on('reset', this.addall, this);
		this.on('add', this.addone, this);
	},
	addone: function(model){
		this.parent.add(model);
	},
	addall: function(){
		this.parent.add(this.models);
	},
	model: MapObjectInstagram,
	url : function(){
		return "https://api.instagram.com/v1/media/search?lat=" + this.lat + "&lng=" + this.lng + "&distance=4000&client_id=" + this.clientid;
	},
	sync: function(method, model, options) {
        var params = _.extend({
            type: 'GET',
            dataType: 'jsonp',
            url: model.url(),
            processData: false
        }, options);

        return $.ajax(params);
    },
    parse: function(response) {
        return _.filter(response.data, function(model){
        	return !this.get(model.id);
        }, this);
    }
});

MapObjects = Backbone.Collection.extend({
	initialize: function(){
		this.collections = {};
		this.collections.foursquare = new MapObjectsfoursquare([],this);
		this.collections.instagram = new MapObjectsInstagram([],this);
	},
	setlocation: function(lat,lng){
		_.each(this.collections, function(collection){
			collection.lat = lat;
			collection.lng = lng;
		}, this);
	},
	fetch: function(){
		_.each(this.collections, function(collection){
			collection.fetch({add: true});
		}, this);
	}
});

return MapApp;
});
