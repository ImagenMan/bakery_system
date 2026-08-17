const readline = require("readline");
const bcrypt = require("bcryptjs");
const db = require("../server/config/database");

function question(prompt) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => {
        rl.question(prompt, answer => {
            rl.close();
            resolve(answer);
        });
    });
}

function hiddenQuestion(prompt) {
    return new Promise((resolve, reject) => {
        const stdin = process.stdin;

        if (!stdin.isTTY) {
            reject(new Error("Hidden input requires an interactive terminal."));
            return;
        }

        process.stdout.write(prompt);

        const wasRaw = stdin.isRaw;

        stdin.setRawMode(true);
        stdin.resume();

        let answer = "";

        function cleanup() {
            stdin.setRawMode(wasRaw);
            stdin.pause();
            stdin.removeListener("data", onData);
        }

        function onData(char) {
            const key = char.toString();

            if (key === "\r" || key === "\n") {
                cleanup();
                process.stdout.write("\n");
                resolve(answer);
                return;
            }

            if (key === "\u0003") {
                cleanup();
                process.stdout.write("\n");
                reject(new Error("Setup cancelled."));
                return;
            }

            if (key === "\u007f" || key === "\b") {
                if (answer.length > 0) {
                    answer = answer.slice(0, -1);
                }
                return;
            }

            answer += key;
        }

        stdin.on("data", onData);
    });
}

async function main() {
    try {
        console.log("🔐 Bakery authentication setup\n");

        const admin = db.prepare(`
            SELECT id, name
            FROM users
            WHERE role = 'ADMIN' AND active = 1
        `).get();

        const counter = db.prepare(`
            SELECT id, name
            FROM users
            WHERE role = 'COUNTER' AND active = 1
        `).get();

        if (!admin) {
            throw new Error("No active ADMIN user found.");
        }

        if (!counter) {
            throw new Error("No active COUNTER user found.");
        }

        const username = (await question("Admin username: ")).trim();

        if (!username) {
            throw new Error("Admin username cannot be empty.");
        }

        const password = await hiddenQuestion("Admin password: ");

        if (!password) {
            throw new Error("Admin password cannot be empty.");
        }

        const pin = await hiddenQuestion("Counter PIN (4 digits): ");

        if (!/^\d{4}$/.test(pin)) {
            throw new Error("Counter PIN must be exactly 4 digits.");
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const pinHash = await bcrypt.hash(pin, 12);

        const setup = db.transaction(() => {
            db.prepare(`
                UPDATE users
                SET
                    username = ?,
                    password_hash = ?,
                    pin_hash = NULL,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).run(username, passwordHash, admin.id);

            db.prepare(`
                UPDATE users
                SET
                    username = NULL,
                    password_hash = NULL,
                    pin_hash = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).run(pinHash, counter.id);
        });

        setup();

        console.log("\n✅ Authentication credentials saved.");
        console.log(`   Admin: ${admin.name}`);
        console.log(`   Counter: ${counter.name}`);
        console.log("   Plaintext credentials were removed from the database.");
    } catch (err) {
        console.error(`\n❌ Authentication setup failed: ${err.message}`);
        process.exitCode = 1;
    } finally {
        db.close();
    }
}

main();
