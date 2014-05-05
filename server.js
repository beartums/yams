var express  = require('express');
var app      = express();
var port     = process.env.PORT || 3002;
var path 		 = require('path');
var mongoose = require('mongoose');
var flash 	 = require('connect-flash');
var moment 	 = require('moment');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var authRouter = require('./app/auth/authRouter');
var serverRouter = require('./serverRouter');	
var configDB = require('./config/database.js');
var morgan = require('morgan');
var ejs = require('ejs');
// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

	// set up our express application
app.set('view engine', 'ejs');
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(session({secret:'Ihopethisislongenoughtobereallyreallydifficulttofigureout'}));
app.use(bodyParser()); // get information from html forms
app.use(flash()); // use connect-flash for flash messages stored in session

app.use('/auth',authRouter);
app.use('/',serverRouter);

//app.locals.moment = moment;

// launch ======================================================================
app.listen(port);
console.log('YAMS cooking on ' + port);
