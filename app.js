var express = require('express'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    passportLocalMongoose = require("passport-local-mongoose"),
    bodyParser = require('body-parser')
    User = require('./models/user')
    Note = require('./models/note')

// configure dotenv
const dotenv = require('dotenv');
dotenv.config();
// connect to MongoDB    
const databaseUri = process.env.MONGODB_URI
mongoose.connect(databaseUri, { useNewUrlParser: true });
//create app
var app = express();
app.use(express.static('public'));
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json()); // for parsing application/json
// passport configuration 
app.use(require("express-session")({
    secret:"This is the final project for pipeline course",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// added as middleware for pages needed user login
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        //req.isAuthenticated() will return true if user is logged in
        next();
    } else{
        res.redirect("/register");
    }
}

// routes
// homepage
app.get('/', function (req, res) {
    res.render('index');
});

// show previous notes
app.get('/history', isLoggedIn, function (req, res) {
    res.send('This is history page.');
});

// show signup form
app.get('/register', function (req, res) {
    res.render("register");
});

// signup logic
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

// logout
app.get('/logout', function (req, res) {
    req.logOut();
    res.redirect("/");
});

// save note to DB
app.post('/save', function (req, res) {
    // NoteSchema: username, time, title, content, tags, audio_filepath
    // TO-DO: get audio file, and save to cloud storage
    // save new note to DB
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
            console.log(note);
        }
    })
    res.send('Note saved successfully.');
});

// analyze texts using google cloud language API
app.post('/nlp', async function (req, res) {
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

// create server 
app.listen(3000, function(){
    console.log("Server has started at port 3000!");
});