const express = require("express");
const router = new express.Router();
const passport = require("passport");

router.get("/", (req, res) => {
  res.render("login.html");
});

router.post("/", (req, res, next) => {
  passport.authenticate("local", function(err, user, info) {
    if (err) return next(err);
    if (!user) return res.redirect("/login");
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.redirect("/game");
    })
  })(req, res, next);
});

module.exports = router;
