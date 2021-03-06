DROP TABLE IF EXISTS plays;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

CREATE TABLE plays (
  id SERIAL PRIMARY KEY,
  user_id SERIAL REFERENCES users(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  level TEXT NOT NULL,
  bombs INTEGER NOT NULL,
  time REAL NOT NULL,
  victory BOOLEAN NOT NULL
);
