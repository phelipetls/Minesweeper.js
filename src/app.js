const express = require("express");
const path = require("path");
const morgan = require("morgan");
const nunjucks = require("nunjucks");

const app = express();
const port = 3000;
const site = require("./routes/site");
const game = require("./routes/game");
const login = require("./routes/login");
const register = require("./routes/register");

nunjucks.configure("src/views", {
  autoescape: true,
  express: app
});

app.use(express.static("src/public"));
app.use(express.json());
app.use(morgan("short"));

});

app.get("/", site.get);
app.get("/game", game.get);
app.get("/login", login.get);

app.get("/register", register.get);
app.post("/register", register.post);

app.listen(port, () => console.log(`Listening at http://localhost:${port}`));
