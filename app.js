var express = require('express')
var app = express()
const path = require('path');
const router = express.Router();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json
app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname+'/index.html'));
});

app.get('/history', function (req, res) {
    res.send('This is history page.');
});

app.post('/nlp', async function (req, res) {
    try { 
        //enter code here
        const language = require('@google-cloud/language');
        // Creates a client
        const client = new language.LanguageServiceClient();
        //
        //res.send('This is nlp service. Input text is: '+req.body.text);
        /**
         * TODO(developer): Uncomment the following line to run this code.
         */
        const text = req.body.text;
        // Prepares a document, representing the provided text
        const document = {
            content: text,
            type: 'PLAIN_TEXT',
        };
        const [result] = await client.analyzeEntities({document});
        //console.log(result);
        res.send(result);
      } catch (error) {
        // something here
        //console.log(error);
    }
});

app.listen(3000, function(){
    console.log("Server has started!");
});