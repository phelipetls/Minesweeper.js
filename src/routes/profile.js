const express = require("express");
const db = require("../db/index");

const router = new express.Router();

router.get("/", async (req, res) => {
  if (!req.user) {
    res.redirect("/login");
    return;
  }

  const resultByLevel = await db.query({
    text: `
    SELECT
      level AS "Difficulty",
      count(level) AS "Games",
      count(CASE WHEN victory IS TRUE THEN 1 ELSE NULL END) AS "Wins",
      to_char(avg(CASE WHEN victory IS TRUE THEN 1 ELSE 0 END) * 100, '999.9%') AS "Win Pct.",
      min(time) AS "Best time",
      max(time) AS "Worst time",
      avg(time) AS "Average time"
    FROM plays
    GROUP BY level
    ORDER BY "Games" DESC;
  `,
    rowMode: "array"
  });

  res.render("profile.html", {
    rows: resultByLevel.rows,
    fields: resultByLevel.fields.map(field => field.name)
  });
});

module.exports = router;
