const fs = require("fs");
const path = require("path");
const db = require("../server/config/database");

const schemaPath = path.join(__dirname, "../data/schema.sql");
const seedPath = path.join(__dirname, "../data/seed.sql");

const schema = fs.readFileSync(schemaPath, "utf8");
const seed = fs.readFileSync(seedPath, "utf8");

console.log("📦 Initializing bakery database...");

try {
    db.exec(schema);
    console.log("✅ Database schema created.");

    db.exec(seed);
    console.log("✅ Seed data loaded.");

    console.log("🎉 Bakery database initialized successfully.");
} catch (err) {
    console.error("❌ Database initialization failed:", err.message);
    process.exitCode = 1;
} finally {
    db.close();
    console.log("🔒 Database connection closed.");
}