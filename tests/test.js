require.config({
	paths: {
		'appmodels': 'models'
	}
});
require(['model'], 
function(m){
	console.log('test');
});