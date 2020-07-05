const express = require("express");
const morgan = require("morgan");
const nunjucks = require("nunjucks");

const site = require("./routes/site");
const game = require("./routes/game");
const login = require("./routes/login");
const register = require("./routes/register");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("src/public"));
app.use(express.urlencoded({ extended: false }));
app.use(morgan("short"));

nunjucks.configure("src/views", {
  autoescape: true,
  express: app
});

app.get("/", site.get);
app.get("/game", game.get);
app.get("/login", login.get);

app.get("/register", register.get);
app.post("/register", register.post);

app.listen(port, () => console.log(`Listening at http://localhost:${port}`));
