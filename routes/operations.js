var express = require("express");
var router  = express.Router();
var Note = require('../models/note');
var multer = require('multer');
var upload = multer();
var fs = require('fs');
var AWS = require('aws-sdk');
var redis = require('redis');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  });

// create and connect redis client to local instance.
const redis_client = redis.createClient(
    process.env.REDIS_PORT,
    process.env.REDIS_ENDPOINT,
    {
      'auth_pass': process.env.REDIS_PASSWORD,
      'return_buffers': true
    }
  ).on('error', (err) => console.error('ERR:REDIS:', err));


// Google NLP API 
const language = require('@google-cloud/language');
// Creates a client
const client = new language.LanguageServiceClient();

// save note to DB
router.post('/save', upload.any(), function (req, res) {
    // NoteSchema: username, time, title, content, tags, audio_filepath
    //console.log(req.body);
    //console.log('Files: ', req.files);
    if(req.isAuthenticated()){
        // get audio file, and save to cloud storage
        var fileName = new Date().toISOString()+'-'+req.session.passport.user;
        console.log(fileName);
        var s3_path = 'https://rawaudios2019.s3.amazonaws.com/'+fileName; 
        var params = {Bucket: 'rawaudios2019', Key: fileName, Body: req.files[0].buffer};
        s3.upload(params, function(err, data) {
            console.log(err, data);
        });
        // save new note to DB
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
        // text content to analyze
        const text = req.body.text;
        console.log(text);
        // Redis part 
        // key to store results in Redis store
        const nlpRedisKey = text;
        // Try fetching the result from Redis first in case we have it cached
        redis_client.get(nlpRedisKey, (err, analyzed) => {
            // If that key exists in Redis store
            if (analyzed) {
                console.log('key exists in Redis store');
                res.send(JSON.parse(analyzed));
                //return JSON.parse(analyzed);
            } else {
                // Key does not exist in Redis store
                async function f() {
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
                    t = {...result, ...result2, ...result3};
                    return t;
                }
                f().then(t => {
                    // Save the  API response in Redis store,  data expire time in defined seconds
                    redis_client.setex(nlpRedisKey, 1800, JSON.stringify(t))
                    // Send JSON response to client
                    console.log('google nlp returns:'+t);
                    //return t;
                    res.send(t);
                })
                .catch(error => {
                    // log error message
                    console.log(error);
                })    
            }
        });
      } catch (error) {
        console.log(error);
    }
});

module.exports = router;