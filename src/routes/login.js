const express = require("express");
const router = new express.Router();
const passport = require("passport");

router.get("/", (req, res) => {
  res.render("login.html");
});

router.post("/", passport.authenticate("local", {
    successRedirect: "/game",
    failureRedirect: "/login",
    failureFlash: true
  })
);

module.exports = router;
