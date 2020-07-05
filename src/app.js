const express = require("express");
const morgan = require("morgan");
const nunjucks = require("nunjucks");

const index = require("./routes/index");
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

app.use("/", index);
app.use("/game", game);
app.use("/login", login);
app.use("/register", register);

app.listen(port, () => console.log(`Listening at http://localhost:${port}`));
