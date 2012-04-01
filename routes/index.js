var request = require('request');
/*
 * GET home page.
 */

exports.proxy = function(req,res){
  	var proxyreq = req.query.request;
	request(proxyreq, function (error, response, body) {
		  if (!error && response.statusCode == 200) {
			res.json(body);
		  } else {
		  	res.json({error: error});
		  }
	});
};


