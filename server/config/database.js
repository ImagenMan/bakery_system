const Database = require("better-sqlite3");
const path = require("path");

function openDatabase(dbPath) {
    const db = new Database(dbPath);

    db.pragma("foreign_keys = ON");

    return db;
}

const productionDbPath = path.join(
    __dirname,
    "../../data/bakery.db"
);

const db = openDatabase(productionDbPath);

console.log("✅ Connected to SQLite database.");

module.exports = db;
module.exports.openDatabase = openDatabase;