var express = require("express");
var router = express.Router();
var Park = require("../models/park");
var middleware = require("../middleware");
var NodeGeocoder = require('node-geocoder');

 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

// INDEX - Show all parks
router.get("/", function(req, res) {
    var perPage = 8;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Park.find({name: regex}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, parks) {
            Park.count({name: regex}).exec(function (err, count) {
                if (err) {
                    console.log(err);
                    res.redirect("back");
                } else {
                    if(parks.length === 0) {
                        req.flash('info', 'Sorry, no Parks match your search. Please try again');
                        return res.redirect('/parks');
                    }
                    res.render("parks/index", {
                        parks: parks,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        search: req.query.search
                    });
                }
            });
        });    
    } else {
    // Get all parks from the Datebase
    Park.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, parks) {
        Park.count().exec(function (err, count) {
            if (err) {
                console.log(err);
            } else {
                res.render("parks/index", {
                    parks: parks,
                    current: pageNumber,
                    pages: Math.ceil(count / perPage),
                    search: false
                });
            }
        });
    });
    }
});

// CREATE - Add new campround to Database
router.post("/", middleware.isLoggedIn, function(req, res) {
   var name = req.body.name;
   var price = req.body.price;
   var image = req.body.image;
   var details = req.body.details
   var author = {
       id: req.user._id,
       username: req.user.username
   }
   geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newPark = {name: name, price: price, image: image, details: details, author:author, location: location, lat: lat, lng: lng};
    // Create a new Park and save to DB
    Park.create(newPark, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to parks page
            res.redirect("/parks");
        }
    });
  });
});

// NEW - Show from to create new park
router.get("/new",  middleware.isLoggedIn, function(req, res) {
   res.render("parks/new");
});

// SHOW - Show info about a Park
router.get("/:id", function(req, res) {
   // Find Park with ID
   Park.findById(req.params.id).populate("comments").exec(function(err, park) {
       if(err || !park) {
           req.flash("error", "Park not found!");
           res.redirect("back");
       } else {
           res.render("parks/detail", {park: park});
       }
   });
});

// EDIT Park Route
router.get("/:id/edit", middleware.checkOwnership, function(req, res) {
    Park.findById(req.params.id, function(err, park) {
        res.render("parks/edit", {park: park});
    });
});

// UPDATE Park Route
router.put("/:id", middleware.checkOwnership, function(req, res){
    geocoder.geocode(req.body.location, function (err, data) {
      if (err || !data.length) {
        req.flash('error', 'Invalid address');
        return res.redirect('back');
      }
      req.body.park.lat = data[0].latitude;
      req.body.park.lng = data[0].longitude;
      req.body.park.location = data[0].formattedAddress;
  
      Park.findByIdAndUpdate(req.params.id, req.body.park, function(err, park){
          if(err){
              req.flash("error", err.message);
              res.redirect("back");
          } else {
              req.flash("success","Park Updated!");
              res.redirect("/parks/" + park._id);
          }
      });
    });
  });

// DELETE Park Route
router.delete("/:id", middleware.checkOwnership, function(req, res) {
    Park.findByIdAndRemove(req.params.id, function(err) {
        if(err) {
            res.redirect("/parks");
        } else {
            req.flash("success","Park Deleted!");
            res.redirect("/parks");
        }
    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;