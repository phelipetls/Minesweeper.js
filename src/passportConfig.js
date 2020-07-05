const db = require("./db/index");
const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local").Strategy;

exports.run = (passport) => {
  async function authenticateUser(username, password, done) {
    try {
      const result = await db.query(
        "SELECT * FROM users WHERE name = $1",
        [username]);

      if (result.rows.length === 0) {
        done(null, false, { message: "User not registered" });
      } else {
        const match = await bcrypt.compare(password, result.rows[0].password);

        if (match) {
          done(null, result.rows[0]);
        } else {
          done(null, false, { message: "Wrong password" });
        }
      }
    } catch (err) {
      done(err);
    }
  }

  passport.use(
    new LocalStrategy(
      { usernameField: "username", passwordField: "password" },
      authenticateUser
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id)
  });

  passport.deserializeUser((id, done) => {
    db.query("SELECT * FROM users WHERE id = $1", [id], (err, result) => {
      if (err) throw err;
      return done(null, result.rows[0]);
    });
  });
}
