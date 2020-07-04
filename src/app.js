const express = require("express");
const path = require("path");
const morgan = require("morgan");
const nunjucks = require("nunjucks");

const app = express();
const port = 3000;

nunjucks.configure("src/views", {
  autoescape: true,
  express: app
});

app.use(express.static("src/public"));
app.use(express.json());
app.use(morgan("short"));

app.get("/", (req, res) => {
  res.render("index.html");
});

app.get("/game", (req, res) => {
  res.render("game.html");
});

app.listen(port, () => console.log(`Listening at http://localhost:${port}`));
