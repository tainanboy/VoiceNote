module.exports = {
    isLoggedIn: function(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        //req.flash('error', 'You must be signed in to do that!');
        res.redirect('/register');
    }
}