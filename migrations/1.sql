CREATE TABLE IF NOT EXISTS user (
  id TEXT PRIMARY KEY,
  google_id TEXT,
  email TEXT UNIQUE,
  image VARCHAR(255),
  first_name TEXT,
  last_name TEXT,
  locale TEXT
);
