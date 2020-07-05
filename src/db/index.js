const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

function getConnectionString() {
  if (process.env.NODE_ENV === "production") {
    return process.env.DATABASE_URL;
  } else {
    return `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;
  }
}

const pool = new Pool({
  connectionString: getConnectionString()
});

module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, callback)
  },
}
