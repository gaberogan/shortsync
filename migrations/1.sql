/* User table */
CREATE TABLE IF NOT EXISTS user (
  id TEXT PRIMARY KEY,
  google_id TEXT UNIQUE, /* Google user id */
  email TEXT UNIQUE,
  image TEXT,
  first_name TEXT,
  last_name TEXT,
  locale TEXT /* e.g. en */
);

/* Channels where you can upload or download videos */
CREATE TABLE IF NOT EXISTS channel (
  id TEXT PRIMARY KEY,
  email TEXT, /* Use email as foreign key since we are using Google's JWT */
  platform TEXT, /* e.g. youtube,tiktok */
  name TEXT, /* e.g. TechLinked */
  image TEXT,
  data TEXT /* Data required for upload or download e.g. refresh_token */
);

/* Search for channel by user */
CREATE INDEX idx_channel_user ON channel(email);
