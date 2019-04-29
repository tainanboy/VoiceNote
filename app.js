var express = require('express'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    passportLocalMongoose = require("passport-local-mongoose"),
    bodyParser = require('body-parser'),
    User = require('./models/user'),
    Note = require('./models/note'),
    multer = require('multer'),
    fs = require('fs'),
    AWS = require('aws-sdk'),
    redis = require('redis')

// configure dotenv
const dotenv = require('dotenv');
dotenv.config();

// connect to MongoDB    
const databaseUri = process.env.MONGODB_URI
mongoose.connect(databaseUri, { useNewUrlParser: true });

// require routes
var authRoutes = require('./routes/index');
    historyRoutes = require('./routes/history');
    operartionsRoutes = require('./routes/operations');

// create app
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
// see user info in every route
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
})
// routes
app.use(authRoutes);
app.use(historyRoutes);
app.use(operartionsRoutes);

// create server 
app.listen(3000, function(){
    console.log("Server has started at port 3000!");
});