// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var secret = "this is my JWT secret because I'm so s3cr3tiv3";

// define the schema for our user model
// 20140408: change model to handle multiple profiles for each social network
var userSchema = mongoose.Schema({

    local            : {
		username	 : String,
		firstName	 : String,
		lastName	 : String,
        email        : String,
        password     : String,
		created		 : Date,
		lastLoggedIn : Date,
		loginCount	 : {type: Number, 'default': 0},
    },

    oauthProviders : [{ // social network authorization
		network		 : String, //Facebook, Google
        id           : String, // Social Network ID for this user
        token        : String, // Token supplied by the social network
        emails       : [String], // array of emails assigned to this user
        name         : String,  // Name of user in network
		linked		 : Date,
		lastLoggedIn : Date,
		loginCount	 : {type: Number, 'default': 0},
    }]

});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

userSchema.methods.createToken = function(user) {
	if (!user && this.id) user = this;
	if (!user) return null;
	var profile = {"username": user.username,
					"id": user.id};
	return jwt.sign(profile,secret,{"expiresInMinutes":60*5});
};

userSchema.statics.decodeToken = function(token) {
	return jwt.decode(token,secret);
};


// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
