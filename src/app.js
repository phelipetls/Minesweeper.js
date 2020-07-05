const express = require("express");
const morgan = require("morgan");
const session = require("express-session");
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

app.use(session({ secret: "secret", resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
passportConfing.run(passport);

nunjucks.configure("src/views", {
  autoescape: true,
  express: app
});

app.use("/", index);
app.use("/game", game);
app.use("/login", login);
app.use("/register", register);

app.post("/login", (req, res, next) => {
  passport.authenticate("local", function(err, user, info) {
    if (err) return next(err);
    if (!user) return res.redirect("/login");
    res.redirect("/game");
  })(req, res, next);
});
app.use("/logout", logout);

app.listen(port, () => console.log(`Listening at http://localhost:${port}`));
