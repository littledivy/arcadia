const express     = require("express");
const passport    = require("passport");
const { ObjectID } = require("mongodb");
const User        = require("../models/user");
const Message     = require("../models/message");
const middleware  = require("../middleware/index");
const mailHandler = require("../handlers/email");

const     router = express.Router();

router.get("/login", (req, res)=>{
    res.render("login", { title: "Login" });
});

router.post("/login", passport.authenticate("local-login", { failureRedirect: "/users/register" }), (req, res) => {
   User.findById(req.user._id).then((rUser)=>{
    rUser.online = true;
    rUser.save();
   });
   res.redirect("/users/@me");
});

router.get("/register", (req, res)=>{
    console.log(req.flash("error"));
    res.render("register", { title: "Register" });
});

router.post("/register", passport.authenticate("local-signup", {
    failureRedirect: "/users/register", // redirect back to the signup page if there is an error
    failureFlash: true,
}), (req, res) => {
 console.log(req.body)
 User.findById(req.user._id).then((rUser)=>{
        rUser.username = req.body.usern;
        rUser.online = true;
        rUser.save();
    mailHandler({
  from: process.env.EMAIL,
  to: req.user.email,
  subject: 'Verify Arcadia Email',
  text: 'test'
  }).then((done) => {
        res.redirect("/users/@me");
  }).catch((e) => { 
        console.log(e)
        res.redirect("/users/@me");
  })
       });
/**
User.findById(req.user._id).then((rUser)=>{
        rUser.online = true;
        rUser.save();
});
       res.redirect("/users/@me");
**/
});

router.get("/logout", middleware.isLogedIn, (req, res)=>{
    User.findById(req.user._id).then((rUser)=>{
        rUser.online = false;
        rUser.save();
       });
    req.logout();
    res.redirect("/");
});


// Users Profile
router.get("/@me", middleware.isLogedIn, (req, res)=>{
    User.findById(req.user._id).populate("channels").populate("friends").then((rUser)=>{
        res.render("profile", { channels: rUser.channels, title: "username", friends: rUser.friends });
    }).catch((e)=>{
        res.send(e);
    });
});

// external user Profile
router.get("/:id", middleware.isLogedIn, (req, res) => {
    User.findById(req.user._id).populate("channels").then((currentUser)=>{
        User.findById(req.params.id).populate("channels").populate("friends").then((rUser)=>{
            if(ObjectID(req.params.id).equals(ObjectID(req.user._id))){
                res.redirect("@me");
            }
            res.render("external_profile", {
                 currentUserChannels: currentUser.channels,
                 channels: rUser.channels,
                 title: "username",
                 friends: rUser.friends,
                 user: rUser,
                });
        }).catch((e) => {
            res.send(e);
        });
    });
});

router.get("/:id/request", middleware.isLogedIn, (req, res) => {
    User.findById(req.user._id).then((currentUser)=>{
        User.findById(req.params.id).then((rUser)=>{
            if(ObjectID(req.params.id).equals(ObjectID(req.user._id))){
                res.redirect("@me");
            }
            else {
              currentUser.friends.push(req.params.id);
              currentUser.save(err => {console.log('done')})
              res.redirect('/users/'+ req.params.id)
            }
        }).catch((e) => {
            res.send(e);
        });
    });
})

router.get("/:id/unfriend", middleware.isLogedIn, (req, res) => {
    User.findById(req.user._id).then((currentUser)=>{
        User.findById(req.params.id).then((rUser)=>{
            if(ObjectID(req.params.id).equals(ObjectID(req.user._id))){
                res.redirect("@me");
            }
            else {
              if(currentUser.friends.includes(req.params.id)) {
                currentUser.friends.splice(currentUser.friends.indexOf(req.params.id), 1);
                currentUser.save(err => {console.log('done')}) 
              }
              res.redirect('/users/'+ req.params.id)
            }
        }).catch((e) => {
            res.send(e);
        });
    });
})

router.patch("/@me/update", middleware.isLogedIn, (req, res)=>{
    User.findByIdAndUpdate(req.user._id, req.body.user).then(()=>{
        res.redirect("/users/@me");
    }).catch((e)=>{
        console.log(e);
        return res.redirect("/users/@me");
    });
});


module.exports = router;
