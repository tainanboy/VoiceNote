var mongoose = require('mongoose');

const databaseUri = process.env.MONGODB_URI
mongoose.connect(databaseUri, { useNewUrlParser: true });

var catSchema = new mongoose.Schema({
    name: String,
    age: Number,
    temperament: String
});

var Cat = mongoose.model("Cat", catSchema);

// adding a new cat to the DB
var george = new Cat({
    name: "George",
    age: 11,
    temperament: "Grounchy"
});

// save to DB
george.save(function(err, cat){
    if (err){
        console.log("Something went wrong.");
    } else{
        console.log("Just saved a cat");
        console.log(cat);
    }
})

// find all elements 
Cat.find({}, function(err, cats){
    if (err){
        console.log(err);
    } else{
        console.log("All the cats: ");
        console.log(cats);
    }
})