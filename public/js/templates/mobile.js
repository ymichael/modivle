/*global define:true *//*jshint  multistr:true */
define(['underscore'], function(_){

var tmpl = {};

//OVERLAY
tmpl.loading = "\
<div class='modal message'>\
	<div id='overlay_close'></div>\
	<span>Loading your modules,<br />Please be patient...</span>\
</div>";

//MAIN
tmpl.headerhome = "\
<img id='logo' src='/img/logo/modivleblack.png'></div>\
<div id='logout'></div>";

tmpl.singlemoduleheader = "\
<div id='home'></div>\
<div id='headerlabel'>{{ code }}</div>\
<div id='logout'></div>";

//MODULE
tmpl.moduleview = "\
<div class='text'>\
	<span class='main'>{{ code }}</span>\
	<span class='desc'>{{ name }}</span>\
</div>\
<div class='nexticon icon'></div>";

//WORKBIN
tmpl.workbinview = "\
<div class='nav'></div>\
<div class='contents'></div>";

tmpl.workbinitemview = "\
<div class='{{type}}icon icon'></div>\
<div class='text'>\
	<span class='main'>{{ name }}</span>\
	<span class='desc'>{{ kind }}, {{ size }}</span>\
</div>";

//FORUM
tmpl.forumview = "\
<div class='nav'></div>\
<div class='contents'></div>";

tmpl.forumheadingview = "\
<div class='headingicon icon'></div>\
<div class='text forumheading'>\
	<span class='main'>{{ name }}</span>\
</div>\
<div class='nexticon icon'></div>";

tmpl.forumforumview = "\
<div class='headingicon icon'></div>\
<div class='text forumheading'>\
	<span class='main'>{{ title }}</span>\
</div>\
<div class='nexticon icon'></div>";

tmpl.forumthreadview = "\
<div class='threadicon icon'></div>\
<div class='text'>\
	<span class='main'>{{ name }}</span>\
	<span class='desc'><span class='author'>{{ author }}</span> &middot; <span class='date'>{{ nicedate }}</span></span>\
</div>";

tmpl.forumpost = "\
<div class='subthreadicon'></div>\
<div class='title'>\
	<span class='main'>{{ name }}</span>\
	<span class='author'>{{ author }}</span>\
	<span class='dot'>&middot;</span>\
	<span class='date'>{{ nicedate }}</span>\
</div>\
<div class='body'>{{ body }}</div>\
<div class='subthreads'></div>";

//ANNOUNCEMENTS
tmpl.announcementsview = "\
<div class='nav'></div>\
<div class='contents'></div>";

tmpl.announcementlist = "\
<div class='announcementicon icon'></div>\
<div class='text'>\
	<span class='main'>{{ title }}</span>\
	<span class='desc'><span class='author'>{{ from }}</span> &middot; <span class='date'>{{ nicedate }}</span></span>\
</div>\
<div class='nexticon icon'></div>";


tmpl.announcementpost = "\
<div class='post announcementpost'>\
	<div class='title'>\
		<span class='main'>{{ title }}</span>\
		<span class='author'>{{ from }}</span>\
		<span class='dot'>&middot;</span>\
		<span class='date'>{{ nicedate }}</span>\
	</div>\
	<div class='body'>{{ contents }}</div>\
</div>";

//INFO
tmpl.infoview = "<div class='info'>{{text}}</div>";

//NAV
tmpl.navview = "\
<div class='back'></div>\
<div class='label'>{{ name }}</div>";

var ich = {};

_.templateSettings = {
	interpolate : /\{\{([\s\S]+?)\}\}/g
};
_.each(_.keys(tmpl), function(key){
	ich[key] = _.template(tmpl[key]);
});

return ich;
});