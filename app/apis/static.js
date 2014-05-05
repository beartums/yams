var express = require('express'),
	console = require('console');
var app = express();

app.use('/client',express.static(__dirname + '/client/app'));

app.listen(3000);
console.log('listening...')