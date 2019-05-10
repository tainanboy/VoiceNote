var express = require("express");
var router  = express.Router();
var middleware = require("../middleware");
var { isLoggedIn } = middleware;
var Note = require('../models/note');

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

//Get the id of the card and redirect to note page

router.post('/history/submit', function(req, res) {
   var id = req.body.id;
  // console.log(req.body);
   res.redirect('/history/' + id);
});

router.get('/history/:id', function(req, res) {
    console.log(req.params);
    var nid= req.params.id;
    console.log(nid);
    Note.find({'_id': nid}, null, function (err, notes) {
        if (err) return handleError(err);
        // 'notes' contains the list of notes that match the criteria.
        //console.log(notes);
        console.log('notes')
        console.log(notes);
        //res.render("history.ejs", {notesVar: notes});
        res.render("note.ejs", {output: notes});

    });
});

module.exports = router;
