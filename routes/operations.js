var express = require("express");
var router  = express.Router();
var Note = require('../models/note');
var multer = require('multer');
var upload = multer();
var fs = require('fs');
var AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  });
// save note to DB
router.post('/save', upload.any(), function (req, res) {
    // NoteSchema: username, time, title, content, tags, audio_filepath
    //console.log(req.body);
    //console.log('Files: ', req.files);

    // get audio file, and save to cloud storage
    var fileName = new Date().toISOString()+'-'+req.session.passport.user;
    console.log(fileName);
    var s3_path = 'https://rawaudios2019.s3.amazonaws.com/'+fileName; 
    var params = {Bucket: 'rawaudios2019', Key: fileName, Body: req.files[0].buffer};
    s3.upload(params, function(err, data) {
        console.log(err, data);
    });
    // save new note to DB
    if(req.isAuthenticated()){
        var newNote = new Note({
            username: req.session.passport.user,
            time: new Date().toLocaleString(),
            title: 'Note on '+new Date().toLocaleString(),
            content: req.body.data,
            tags: [''],
            audio_filepath: s3_path
        });
        newNote.save(function(err, note){
            if (err){
                console.log(err);
            } else{
                console.log('new note saved to DB');
                console.log(note);
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
        // NER
        var [result] = await client.analyzeEntities({document});
        // content classification
        var [result2] = await client.classifyText({document});
        // sentiment
        var [result3] = await client.analyzeSentiment({document});
        var totalresult = {...result, ...result2, ...result3};
        //console.log(totalresult);
        res.send(totalresult);
      } catch (error) {
        console.log(error);
    }
});

module.exports = router;