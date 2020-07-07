const express = require("express");
const router = new express.Router();
const db = require("../db/index");

router.get("/", (req, res) => {
  res.render("game.html");
});

router.post("/", (req, res) => {
  if (req.user) {
    const { width, height, bombs, level, time, victory } = req.body;
    const { id } = req.user;
    db.query(
      `
      INSERT INTO plays (user_id, width, height, level, bombs, time, victory)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [id, width, height, level, bombs, time, victory]
    );

    res.status(200).end();
  } else {
    res.status(401).end();
  }
});

module.exports = router;
