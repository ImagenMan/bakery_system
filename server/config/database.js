const Database = require("better-sqlite3");
const path = require("path");

// Database location
const dbPath = path.join(__dirname, "../../data/bakery.db");

// Open (or create) the database
const db = new Database(dbPath);

// Enable foreign key enforcement
db.pragma("foreign_keys = ON");

console.log("✅ Connected to SQLite database.");

module.exports = db;