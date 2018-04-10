var Park = require("../models/park");
var Comment = require("../models/comment");

var middlewareObject = {};

middlewareObject.checkOwnership = function(req, res, next) {
    if(req.isAuthenticated()) {
        Park.findById(req.params.id, function(err, park) {
            if(err || !park) {
                req.flash("error", "Park not found!");
                res.redirect("back");
            } else {
                // Does User Own the park
                if(park.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                } else {
                    req.flash("error", "You are not authorized to perform this action!");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "Please Login to proceed!");
        res.redirect("back");
    }
}

middlewareObject.checkCommentOwnership = function(req, res, next) {
    if(req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function(err, comment) {
            if(err || !comment) {
                req.flash("error", "Comment not found!");
                res.redirect("back");
            } else {
                // Does User Own the comment
                if(comment.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                } else {
                    req.flash("error", "You are not authorized to perform this action!");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "Please Login to proceed!");
        res.redirect("back");
    }
}

middlewareObject.isLoggedIn = function(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Please Login or Sign Up before proceeding!");
    res.redirect("/login");
}

module.exports = middlewareObject