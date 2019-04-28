var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

// define user schema
var NoteSchema = new mongoose.Schema({
    username: String,
    time: Date,
    title: String, 
    content: String,
    tags: [String],
    audio_filepath: String
});

//
NoteSchema.plugin(passportLocalMongoose);
// export User model
module.exports = mongoose.model("Note", NoteSchema);