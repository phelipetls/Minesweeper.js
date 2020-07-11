const express = require("express");
const db = require("../db/index");

const router = new express.Router();

router.get("/", (req, res) => {
  res.render("leaderboards.html");
});

router.post("/", async (req, res) => {
  try {
    const { difficulty, interval, page } = req.body;

    const result = await db.query({
      text: `
      SELECT users.name AS Player,
             plays.width AS Width,
             plays.height AS Height,
             plays.bombs AS Bombs,
             plays.time AS Time
      FROM users JOIN plays ON (users.id = plays.user_id)
      WHERE plays.victory IS TRUE
            AND plays.level = $1
            AND (plays.date BETWEEN CURRENT_DATE - $2::interval AND CURRENT_DATE)
      ORDER BY time DESC
      LIMIT 10
      OFFSET 10 * ($3 - 1)
      ;
    `,
      values: [difficulty, interval, page]
    });

    res.send(result.rows);
  } catch (err) {
    throw err;
  }
});

module.exports = router;
