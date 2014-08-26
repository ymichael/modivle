/*global define:true *//*jshint  multistr:true */
define(['underscore'], function(_){

var tmpl = {};

//overlay
tmpl.loading = "\
<div class='modal message'>\
	<div id='overlay_close'></div>\
	<span>Loading your modules, Please be patient...</span>\
</div>";

tmpl.keyboardshortcuts = "\
<div class='modal keyboardshortcuts'>\
	<div id='overlay_close'></div>\
	<div class='title'>Keyboard shortcuts</div>\
	<div class='contents'>\
		<div class='navigation col'>\
			<div class='coltitle'>Navigation</div>\
			<div class='row'>\
				<span class='keys'>\
					<span class='key'>J</span>\
				</span>\
				<span class='desc'>Next</span>\
			</div>\
			<div class='row'>\
				<span class='keys'>\
					<span class='key'>K</span>\
				</span>\
				<span class='desc'>Previous</span>\
			</div>\
			<div class='row'>\
				<span class='keys'>\
					<span class='key'>Enter</span>\
				</span>\
				<span class='desc'>Action / Select</span>\
			</div>\
			<div class='row'>\
				<span class='keys'>\
					<span class='key'>?</span>\
				</span>\
				<span class='desc'>This menu</span>\
			</div>\
			<div class='row'>\
				<span class='keys'>\
					<span class='key'>Esc</span>\
				</span>\
				<span class='desc'>Close this menu</span>\
			</div>\
		</div>\
		<div class='jumping col'>\
			<div class='coltitle'>Jumping</div>\
			<div class='row'>\
				<span class='keys'>\
					<span class='key'>G</span>\
					<span class='key'>M</span>\
				</span>\
				<span class='desc'>Modules</span>\
			</div>\
			<div class='row'>\
				<span class='keys'>\
					<span class='key'>G</span>\
					<span class='key'>A</span>\
				</span>\
				<span class='desc'>Announcements</span>\
			</div>\
			<div class='row'>\
				<span class='keys'>\
					<span class='key'>G</span>\
					<span class='key'>W</span>\
				</span>\
				<span class='desc'>Workbin</span>\
			</div>\
			<div class='row'>\
				<span class='keys'>\
					<span class='key'>G</span>\
					<span class='key'>F</span>\
				</span>\
				<span class='desc'>Forum</span>\
			</div>\
		</div>\
	</div>\
</div>";

// MAIN
tmpl.moduleview = "<div class='modulecode'>{{code}}</div>";

tmpl.contentview = "\
<div id='tabs'></div>\
<div id='tabcontent'></div>";

//BREADCRUMBS
tmpl.breadcrumb = "\
<div class='arrow'></div>\
<span>{{name}}</span>";

tmpl.breadcrumbicon = "<div class='icon {{type}}icon'></div>";

//FORUM
tmpl.forumview = "\
<div class='tabheading' id='forumheader'></div>\
<div class='tabcontents'>\
	<div id='forumcontents'></div>\
</div>";

tmpl.forumheadingview = "\
<div class='rowname'>\
	<div class='rowicon headingicon'></div>\
	<span>{{name}}</span>\
</div>\
<div class='rowcol2'></div>\
<div class='rowcol3'></div>";

tmpl.forumthreadview = "\
<div class='rowicon threadicon'></div>\
<div class='posttitle'>\
	<div class='posttitlemain'>\
		<span class='main'>{{ name }}</span>\
		<span class='dot'>&middot;</span>\
		<span class='author'>{{ author }}</span>\
	</div>\
	<span class='date'>{{ nicedate }}</span>\
</div>";

tmpl.forumforumview = "\
<div class='rowname'>\
	<div class='rowicon headingicon'></div>\
	<span>{{title}}</span>\
</div>\
<div class='rowcol2'></div>\
<div class='rowcol3'></div>";

tmpl.forumthreadsthreadview = "\
<div class='rowname'>\
	<span>{{title}}</span>\
</div>\
<div class='rowcol2'></div>\
<div class='rowcol3'></div>";

tmpl.forumpost = "\
<div class='subthreadicon'></div>\
<div class='posttitle'>\
	<div class='posttitlemain'>\
		<span class='main'>{{ name }}</span>\
		<span class='dot'>&middot;</span>\
		<span class='author'>{{ author }}</span>\
	</div>\
	<span class='date'>{{ nicedate }}</span>\
</div>\
<div class='postbody'>{{ body }}</div>\
<div id='{{ id }}' class='subthreads'></div>";

//ANNOUNCEMENTS
tmpl.announcementview = "\
<div class='posttitle'>\
	<div class='posttitlemain'>\
		<span class='main'>{{ title }}</span>\
		<span class='dot'>&middot;</span>\
		<span class='author'>{{ from }}</span>\
	</div>\
	<span class='date'>{{ nicedate }}</span>\
</div>\
<div class='postbody'>{{ contents }}</div>";

tmpl.inforow = "<div class='inforow tabrow'>{{text}}</div>";

//WORKBIN
tmpl.emptyfolder = "\
<div class='folder'>\
	<span>this folder is empty.</span>\
</div>";


tmpl.loadingfolder = "\
<div class='folder'>\
	<span>loading...</span>\
</div>";

tmpl.workbinview = "\
<div class='tabheading' id='workbinheading'></div>\
<div class='tabrowinfo tabrow'>\
	<div class='rowname'>\
		<div class='rowicon'></div>\
		<span>Name</span>\
	</div>\
	<div class='rowcol2'>Kind</div>\
	<div class='rowcol3'>Size</div>\
</div>\
<div id='filescontainer'><div>";

tmpl.itemview = "\
<div class='rowname'>\
	<div class='rowicon {{filetype}}'></div>\
	<span>{{name}}</span>\
</div>\
<div class='rowcol2'>{{kind}}</div>\
<div class='rowcol3'>{{size}}</div>";


var ich = {};

_.templateSettings = {
	interpolate : /\{\{([\s\S]+?)\}\}/g
};
_.each(_.keys(tmpl), function(key){
	ich[key] = _.template(tmpl[key]);
});

return ich;
});