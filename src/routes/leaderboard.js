const express = require("express");
const db = require("../db/index");

const router = new express.Router();

router.get("/", (req, res) => {
  res.render("leaderboard.html");
});

router.post("/", async (req, res) => {
  try {
    const { difficulty, dateInterval, dateOffset, topPlayers } = req.body;

    let fullDateInterval =
      dateInterval === "all-time"
        ? "100 years"
        : `${dateOffset} ${dateInterval}`;

    const result = await db.query({
      text: `
      SELECT users.name AS Player,
             plays.time AS Time,
             plays.width AS Width,
             plays.height AS Height,
             plays.bombs AS Bombs
      FROM users JOIN plays ON (users.id = plays.user_id)
      WHERE plays.victory IS TRUE
            AND plays.level = $1
            AND (plays.date BETWEEN CURRENT_DATE - $2::interval AND CURRENT_DATE)
      ORDER BY time ASC
      LIMIT $3
      ;
    `,
      values: [difficulty, fullDateInterval, topPlayers]
    });

    res.send(result.rows);
  } catch (err) {
    throw err;
  }
});

module.exports = router;
