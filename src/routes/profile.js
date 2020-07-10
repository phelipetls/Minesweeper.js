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
      count(CASE WHEN victory IS TRUE THEN 1 ELSE NULL END) AS "Wins",
      avg(CASE WHEN victory IS TRUE THEN 1 ELSE 0 END) AS "Win Pct.",
      min(CASE WHEN victory IS TRUE THEN time ELSE NULL END) AS "Best time",
      max(CASE WHEN victory IS TRUE THEN time ELSE NULL END) AS "Worst time",
      avg(CASE WHEN victory IS TRUE THEN time ELSE NULL END) AS "Average time"
    FROM plays
    GROUP BY level
    ORDER BY "Games" DESC;
  `,
    rowMode: "array"
  });

  res.render("profile.html", { result: result });
});

module.exports = router;
