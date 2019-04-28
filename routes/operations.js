var express = require("express");
var router  = express.Router();
var Note = require('../models/note');

// save note to DB
router.post('/save', function (req, res) {
    // NoteSchema: username, time, title, content, tags, audio_filepath
    // TO-DO: get audio file, and save to cloud storage
    // save new note to DB
    if(req.isAuthenticated()){
        var newNote = new Note({
            username: req.session.passport.user,
            time: new Date(),
            title: '',
            content: req.body.data,
            tags: [''],
            audio_filepath: ''
        });
        newNote.save(function(err, note){
            if (err){
                console.log(err);
            } else{
                console.log('new note saved to DB');
                //console.log(note);
            }
        })
        res.send('Note saved successfully.');
    } else{
        res.send('Please login to continue.');
    }
});

// analyze texts using google cloud language API
router.post('/nlp', async function (req, res) {
    try { 
        //enter code here
        const language = require('@google-cloud/language');
        // Creates a client
        const client = new language.LanguageServiceClient();
        //
        const text = req.body.text;
        // Prepares a document, representing the provided text
        const document = {
            content: text,
            type: 'PLAIN_TEXT',
        };
        const [result] = await client.analyzeEntities({document});
        res.send(result);
      } catch (error) {
        console.log(error);
    }
});

module.exports = router;