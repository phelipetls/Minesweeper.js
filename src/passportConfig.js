const db = require("./db/index");
const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local").Strategy;

exports.run = passport => {
  async function authenticateUser(username, password, done) {
    try {
      const {
        rows
      } = await db.query("SELECT id, password FROM users WHERE name = $1", [
        username
      ]);

      if (rows.length === 0) {
        done(null, false, { message: "User not registered" });
      } else {
        const match = await bcrypt.compare(password, rows[0].password);

        if (match) {
          done(null, rows[0]);
        } else {
          done(null, false, { message: "Wrong password" });
        }
      }
    } catch (err) {
      done(err);
    }
  }

  passport.use(new LocalStrategy(authenticateUser));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    db.query(
      "SELECT id, password FROM users WHERE id = $1",
      [id],
      (err, result) => {
        if (err) throw err;
        return done(null, result.rows[0]);
      }
    );
  });
};
