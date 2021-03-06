const express = require("express");
const morgan = require("morgan");
const session = require("express-session");
const flash = require("express-flash");
const nunjucks = require("nunjucks");
const crypto = require("crypto");
const passport = require("passport");
const passportConfing = require("./passportConfig");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("src/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("short"));
app.use(flash());

app.use(
  session({
    secret: crypto.randomBytes(6).toString("hex"),
    resave: false,
    saveUninitialized: false,
    cookie: { sameSite: "strict" }
  })
);

app.use(passport.initialize());
app.use(passport.session());
passportConfing.run(passport);

const env = nunjucks.configure("src/views", { express: app });

env.addFilter("percent", function(num) {
  return `${num * 100}%`;
});

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

const index = require("./routes/index");
const game = require("./routes/game");
const login = require("./routes/login");
const register = require("./routes/register");
const logout = require("./routes/logout");
const profile = require("./routes/profile");
const tutorial = require("./routes/tutorial");
const leaderboard = require("./routes/leaderboard");

app.use("/", index);
app.use("/game", game);
app.use("/login", login);
app.use("/register", register);
app.use("/logout", logout);
app.use("/profile", profile);
app.use("/tutorial", tutorial);
app.use("/leaderboard", leaderboard);

app.listen(port, () => console.log(`Listening at http://localhost:${port}`));
