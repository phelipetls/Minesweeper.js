const express = require("express");
const morgan = require("morgan");
const session = require("express-session");
const flash = require("express-flash");
const nunjucks = require("nunjucks");
const passport = require("passport");
const passportConfing = require("./passportConfig");

const index = require("./routes/index");
const game = require("./routes/game");
const login = require("./routes/login");
const register = require("./routes/register");
const logout = require("./routes/logout");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("src/public"));
app.use(express.urlencoded({ extended: false }));
app.use(morgan("short"));
app.use(flash());

app.use(session({ secret: "secret", resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
passportConfing.run(passport);

nunjucks.configure("src/views", {
  autoescape: true,
  express: app
});

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

app.use("/", index);
app.use("/game", game);
app.use("/login", login);
app.use("/register", register);
app.use("/logout", logout);

app.listen(port, () => console.log(`Listening at http://localhost:${port}`));
