const express = require("express");
const router = new express.Router();
const db = require("../db/index");

router.get("/", (req, res) => {
  res.render("game.html");
});

router.post("/", async (req, res) => {
  if (req.user) {
    const { width, height, bombs, time, victory } = req.body;
    const { id } = req.user;
    const { rows } = await db.query(`
      INSERT INTO plays (user_id, width, height, bombs, time, victory)
      VALUES ($1, $2, $3, $4, $5, $6)
      `, [id, width, height, bombs, time, victory]
    );
  } else {
    res.status(200).send("Nothing to be done");
  }
});

module.exports = router;
