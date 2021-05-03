const { Pool } = require("pg");

function getConnectionString() {
  if (process.env.NODE_ENV === "production") {
    return process.env.DATABASE_URL;
  } else {
    require("dotenv").config();
    return `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;
  }
}

const pool = new Pool({
  connectionString: getConnectionString(),
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, callback);
  }
};
