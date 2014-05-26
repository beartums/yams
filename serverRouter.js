var express = require('express')

	router = express.Router();
	
	router.get('/favicon.ico',function(req,res,next) {
		res.sendfile('./yams48Transp.png');
	});
	
	router.get('',function(req,res,next) {
		res.sendfile('./index.html');
	});



module.exports = router
