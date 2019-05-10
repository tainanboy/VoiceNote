var express = require("express");
var router  = express.Router();
var middleware = require("../middleware");
var { isLoggedIn } = middleware;
var Note = require('../models/note');
var User = require('../models/user');


//update the database with id and content
router.post('/note/update', function(req, res) {
   var id = req.body.id;
   var content = req.body.content;
   console.log(id);
   console.log(content);
   //console.log(req);
  //access to the mangoDB
  //Note.update({'_id':id}, {"content" : content}, {upsert:true});
  Note.updateOne({'_id':id}, {$set: {content : content}},
                   function (err) {
                     console.log(err);
                       if (err) return handleError(err);
                   });



});

module.exports = router;
