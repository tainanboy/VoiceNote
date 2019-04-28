var express = require("express");
var router  = express.Router();
var User = require('../models/user');
var passport = require('passport');

// homepage route
router.get('/', function (req, res) {
    res.render("index.ejs");
});

// signup and login route
router.get('/register', function (req, res) {
    res.render("register");
});

// signup logic
router.post('/register', function(req, res) {
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
router.post('/login', passport.authenticate("local", {
    successRedirect: '/',
    failureRedirect: '/register'
}),function(req, res) {
});

// logout route
router.get('/logout', function (req, res) {
    req.logOut();
    res.redirect("/");
});

module.exports = router;