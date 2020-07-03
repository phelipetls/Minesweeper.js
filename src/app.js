const express = require("express");
const path = require("path");
const morgan = require("morgan");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(express.json());
app.use(morgan("short"));

const db = new sqlite3.Database("./db/minesweeper.db");

db.run(`
  CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    bombs INTEGER NOT NULL,
    time REAL NOT NULL,
    victory INTEGER NOT NULL
)`);

const indexHtml = path.join(__dirname, "public/minesweeper.html");

app.get("/", (req, res) => {
  res.sendFile(indexHtml);
});

app.post("/", (req, res) => {
  db.serialize(() => {
    db.run(
      `INSERT INTO games (name, width, height, bombs, time, victory) VALUES (?, ?, ?, ?, ?, ?)`,
      Object.values(req.body)
    );
  });

  res.sendStatus(200);
});

app.listen(port, () => console.log(`Listening at http://localhost:${port}`));
