const express = require("express");
const path = require("path");

const app = express();
const port = 3000;

app.use(express.static("public"));

const minesweeperHTML = path.join(__dirname, "public/minesweeper.html");

app.get("/", (req, res) => {
  res.sendFile(minesweeperHTML);
});

app.listen(port, () => console.log(`Listening at http://localhost:${port}`));
