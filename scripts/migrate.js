const fs = require("fs");
const path = require("path");
const db = require("../server/config/database");

const migrationsPath = path.join(
    __dirname,
    "../data/migrations"
);

console.log("🔄 Running database migrations...");

try {
    db.exec(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            migration TEXT NOT NULL UNIQUE,
            applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

const migrationColumns = db
.prepare(`PRAGMA table_info(schema_migrations)`)
.all();

const hasMigrationColumn = migrationColumns.some(
    column => column.name === "migration"
);

const hasFilenameColumn = migrationColumns.some(
    column => column.name === "filename"
);

if (!hasMigrationColumn && hasFilenameColumn) {
    db.exec(`
        ALTER TABLE schema_migrations
        RENAME COLUMN filename TO migration
    `);

    console.log(
        "🔧 Upgraded legacy schema_migrations column."
    );
}

    const migrations = fs.readdirSync(migrationsPath)
        .filter(file => file.endsWith(".sql"))
        .sort();

    for (const filename of migrations) {
        const alreadyApplied = db.prepare(`
            SELECT id
            FROM schema_migrations
            WHERE migration = ?
        `).get(filename);

        if (alreadyApplied) {
            console.log(`⏭️  Skipping ${filename}`);
            continue;
        }

        const migrationPath = path.join(
            migrationsPath,
            filename
        );

        const sql = fs.readFileSync(
            migrationPath,
            "utf8"
        );

        const runMigration = db.transaction(() => {
            db.exec(sql);

            db.prepare(`
                INSERT INTO schema_migrations (migration)
                VALUES (?)
            `).run(filename);
        });

        runMigration();

        console.log(`✅ Applied ${filename}`);
    }

    console.log("🎉 Database migrations complete.");
} catch (err) {
    console.error(
        "❌ Migration failed:",
        err.message
    );

    process.exitCode = 1;
} finally {
    db.close();
    console.log("🔒 Database connection closed.");
}