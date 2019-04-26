const dotenv = require('dotenv');
dotenv.config();

var express = require('express'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    bodyParser = require('body-parser')
    User = require('./models/user'),
    LocalStrategy = require('passport-local'),
    passportLocalMongoose = require("passport-local-mongoose")

const databaseUri = process.env.MONGODB_URI
mongoose.connect(databaseUri, { useNewUrlParser: true });

var app = express();
app.use(express.static('public'));
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json()); // for parsing application/json
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// routes
// homepage
app.get('/', function (req, res) {
    res.render('index');
});

// show previous notes
app.get('/history', function (req, res) {
    res.send('This is history page.');
});

// show signup form
app.get('/register', function (req, res) {
    res.render("register");
});

// handling user signup logic
app.post('/register', function(req, res) {
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect("/");
        });
    });
});

// login logic
// middleware: passport.authenticate
app.post('/login', passport.authenticate("local", {
    successRedirect: '/',
    failureRedirect: '/register'
}),function(req, res) {
});

// analyze texts using google cloud language API
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
    console.log("Server has started at port 3000!");
});