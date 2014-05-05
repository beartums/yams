var express = require('express')


	
	serverRouter = express.Router();
	
	serverRouter.get('',function(req,res,next) {
		console.log('serving index');
		res.sendfile('./index.html');
	});



module.exports = serverRouter
