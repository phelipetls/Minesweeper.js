const express = require("express");
const db = require("../db/index");

const router = new express.Router();

router.get("/", async (req, res) => {
  if (!req.user) {
    res.redirect("/login");
    return;
  }

  const result = await db.query({
    text: `
    SELECT
      level AS "Difficulty",
      count(level) AS "Games",
      count(victory) FILTER(WHERE victory IS TRUE) AS "Wins",
      avg(victory::int)::numeric(3, 2) AS "Win Pct.",
      min(time) FILTER(WHERE victory IS TRUE) AS "Best time",
      max(time) FILTER(WHERE victory IS TRUE) AS "Worst time",
      avg(time) FILTER(WHERE victory IS TRUE) AS "Average time"
    FROM plays
    GROUP BY level
    ORDER BY "Games" DESC;
  `,
    rowMode: "array"
  });

  res.render("profile.html", { result: result });
});

module.exports = router;
