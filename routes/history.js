var express = require("express");
var router  = express.Router();
var middleware = require("../middleware");
var { isLoggedIn } = middleware;
var Note = require('../models/note');
var id = ""
var app = express();

// previous notes of the users route
router.get('/history', isLoggedIn, function (req, res) {
    user = req.session.passport.user;
    Note.find({'username': user}, null, {sort: '-time'}, function (err, notes) {
        if (err) return handleError(err);
        // 'notes' contains the list of notes that match the criteria.
        //console.log(notes);
        res.render("history.ejs", {notesVar: notes});
    });
});

//back to homepage
router.get('/', function (req, res) {
    res.render("index.ejs");
});

router.post('/getID', function(req, res) {
	console.log(req);

});


module.exports = router;
