var express = require('express')
var app = express()
const path = require('path');
const router = express.Router();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json
app.use(express.static('public'));

// Imports the Google Cloud client library
const language = require('@google-cloud/language');
// Instantiates a client
const client = new language.LanguageServiceClient();

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname+'/index.html'));
});

app.get('/history', function (req, res) {
    res.send('This is history page.');
});

app.post('/nlp', function (req, res) {
    try { 
        //enter code here
        console.log(req.body.text);
        //console.log(req.body.data);
        res.send('This is nlp service. Input text is: '+req.body.text);
      } catch (error) {
        // something here
        //console.log(error);
    }
});

app.listen(3000, function(){
    console.log("Server has started!");
});