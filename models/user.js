var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

// define user schema
var UserSchema = new mongoose.Schema({
    username: String,
    password: String
});

//
UserSchema.plugin(passportLocalMongoose);
// export User model
module.exports = mongoose.model("User", UserSchema);
