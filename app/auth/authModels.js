// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
// 20140408: change model to handle multiple profiles for each social network
var userSchema = mongoose.Schema({

    local            : {
        email        : String,
        password     : String,
				created			 : Date,
				lastLoggedIn : Date,
				loginCount	 : {type: Number, default: 0},
    },

    oauthProviders        : [{ // social network authorization
				network			 : String, //Facebook, Google
        id           : String, // Social Network ID for this user
        token        : String, // Token supplied by the social network
        emails       : [String], // Email identifying this user in the social network
        name         : String,  // Name of user in network
				linked			 : Date,
				lastLoggedIn : Date,
				loginCount	 : {type: Number, default: 0},
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

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
