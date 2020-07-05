const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db/index");
const auth = require("./auth.js");
const router = new express.Router();

module.exports = router;

router.get("/", (req, res) => {
  res.render("register.html");
});

router.post("/", async (req, res) => {
  const { username, password, password2 } = req.body;

  const errors = auth.validate(username, password, password2);

  if (errors.length > 0) {
    res.render("register.html", { errors: errors });
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query("INSERT INTO users (name, password) VALUES ($1, $2)", [
      username,
      hashedPassword
    ])
      .then(result => res.redirect("/login"))
      .catch(err => {
        if (err.code == 23505) {
          errors.push({ message: "User already registered" });
          res.render("register.html", { errors: errors });
        } else {
          throw err;
        }
      });
  }
});
