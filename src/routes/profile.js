const express = require("express");
const router = new express.Router();

router.get("/", (req, res) => {
  res.render("profile.html");
});

module.exports = router;
