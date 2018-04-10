var express = require("express");
var router = express.Router({mergeParams: true});
var Park = require("../models/park");
var Comment = require("../models/comment");
var middleware = require("../middleware");

router.get("/new", middleware.isLoggedIn, function(req, res) {
    Park.findById(req.params.id, function(err, park) {
        if(err) {
            console.log(err);
        } else {
            res.render("comments/newComment", {park: park});
        }
    })
});

router.post("/", middleware.isLoggedIn, function(req, res) {
    //lookup Park using ID
    Park.findById(req.params.id, function(err, park) {
        if(err) {
            console.log(err);
            res.redirect("/parks");
        } else {
            Comment.create(req.body.comment, function(err, comment) {
                if(err) {
                    req.flash("error", "Something went wrong!");
                    console.log(err);
                } else {
                    // Add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    // Save comment
                    comment.save();
                    park.comments.push(comment);
                    park.save();
                    req.flash("success", "Comment Added!");
                    res.redirect("/parks/" + park._id);
                }
            })
        }
    });
});

// EDIT Comment Route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res) {
    Park.findById(req.params.id, function(err, park) {
        if(err || !park) {
            req.flash("error", "Park not found!");
            return res.redirect("back");
        }
        Comment.findById(req.params.comment_id, function(err, comment) {
            if(err) {
                res.redirect("back");
            } else {
                res.render("comments/editComment", {park_id: req.params.id, comment: comment});
            }
        });
    });
});

// UPDATE Comment
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, comment) {
        if(err) {
            res.redirect("back");
        } else {
            req.flash("success", "Comment Updated!");
            res.redirect("/parks/" + req.params.id);
        }
    });
});

// DELETE Comment Route
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function(err) {
        if(err) {
            res.redirect("back");
        } else {
            req.flash("success", "Comment Deleted!");
            res.redirect("/parks/" + req.params.id);
        }
    });
});


module.exports = router;