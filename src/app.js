const express = require("express");
const path = require("path");

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(express.json());

const minesweeperHTML = path.join(__dirname, "public/minesweeper.html");

app.get("/", (req, res) => {
  res.sendFile(minesweeperHTML);
});

app.post("/", (req, res) => {
  console.log(`Game registered successfully. Body: ${JSON.stringify(req.body)}`);
  res.sendStatus(200);
});

app.listen(port, () => console.log(`Listening at http://localhost:${port}`));
