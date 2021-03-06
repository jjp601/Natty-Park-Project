require('dotenv').config();

var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    flash       = require("connect-flash"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    Park        = require("./models/park"),
    Comment     = require("./models/comment"),
    User        = require("./models/user"),
    seedDB      = require("./seeds");

// Requiring Routes
var commentRoutes   = require("./routes/comments"),
    parkRoutes      = require("./routes/parks"),
    indexRoutes     = require("./routes/index");

// Connect to Mongo Database
var databaseURL = process.env.DATABASEURL || "mongodb://localhost/natty_park";
mongoose.connect(databaseURL);

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
// seedDB(); // Populates the database

app.locals.moment = require('moment');

//PASSPORT CONFIG
app.use(require("express-session")({
    secret: "I am the real Napster!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.info = req.flash("info");
    next();
});

app.use(indexRoutes);
app.use("/parks", parkRoutes);
app.use("/parks/:id/comments", commentRoutes);

app.listen(process.env.PORT || 3000, function() {
    console.log("NattyPark has started!!!");
});