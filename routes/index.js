var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Park = require("../models/park");


// Root Route
router.get("/", function(req, res) {
    res.render("landing");
});


// ============
// AUTH ROUTES
// ============
// show register form
router.get("/register", function(req, res){
    res.render("register", {page: 'register'}); 
 });
// Handle sign up logic
router.post("/register", function(req, res) {
    var newUser = new User(
        {
            username: req.body.username, 
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            image: req.body.image
        });
    if(req.body.admin === 'parkRanger123') {
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function(err, user) {
        if(err) {
            req.flash("error", err.message);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function() {
            req.flash("success", "Welcome to NattyPark " + user.username);
            res.redirect("/parks");
        });
    });
});

//show login form
router.get("/login", function(req, res){
    res.render("login", {page: 'login'}); 
 });

// Handling login logic
router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/parks",
        failureRedirect: "/login",
        failureFlash: true,
        successFlash: "Welcome to NattyPark"
    }), function(req, res) {
});

// Logout Route
router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "You have been logged out!");
    res.redirect("/parks");
});


// User Profile
router.get("/users/:id", function(req, res) {
    User.findById(req.params.id, function(err, user) {
        if(err) {
            req.flash("error", "Something went wrong.");
            res.redirect("/parks");
        }
        Park.find().where("author.id").equals(user._id).exec(function(err, parks) {
            if(err) {
                req.flash("error", "Something went wrong.");
                res.redirect("/parks");
            }
            res.render("users/profile", {user: user, parks: parks});
        });
    });
});

module.exports = router; 