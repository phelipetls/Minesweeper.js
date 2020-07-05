const express = require("express");
const router = new express.Router();

router.get("/", (req, res) => {
  req.logOut();
  res.redirect("/game");
});

module.exports = router;
