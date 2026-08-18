const db = require("../config/database");
const bcrypt = require("bcryptjs");

function getUserById(id) {
    if (!Number.isInteger(id)) {
        throw new Error("A valid user ID is required.");
    }

    return db.prepare(`
        SELECT
            id,
            name,
            username,
            role,
            language,
            active,
            created_at,
            updated_at
        FROM users
        WHERE id = ?
    `).get(id);
}

function findById(id) {
    const user = getUserById(id);

    if (!user) {
        throw new Error("User not found.");
    }

    return user;
}

function findByUsername(username) {
    if (typeof username !== "string" || !username.trim()) {
        throw new Error("A valid username is required.");
    }

    return db.prepare(`
        SELECT
            id,
            name,
            username,
            role,
            language,
            active,
            created_at,
            updated_at
        FROM users
        WHERE username = ?
    `).get(username.trim());
}

function verifyPassword(username, password) {
    const user = findByUsername(username);

    if (!user) {
        throw new Error("Invalid username or password.");
    }

    if (!user.active) {
        throw new Error("User is not active.");
    }

    const row = db.prepare(`
        SELECT password_hash
        FROM users
        WHERE id = ?
    `).get(user.id);

    if (!row.password_hash) {
        throw new Error("Password authentication is not configured for this user.");
    }

    if (!bcrypt.compareSync(password, row.password_hash)) {
        throw new Error("Invalid username or password.");
    }

    return user;
}

function verifyPin(userId, pin) {
    if (typeof pin !== "string" || !/^\d{4}$/.test(pin)) {
        throw new Error("PIN must be exactly 4 digits.");
    }

    const user = findById(userId);

    if (!user.active) {
        throw new Error("User is not active.");
    }

    const row = db.prepare(`
        SELECT pin_hash
        FROM users
        WHERE id = ?
    `).get(user.id);

    if (!row.pin_hash) {
        throw new Error("PIN authentication is not configured for this user.");
    }

    if (!bcrypt.compareSync(pin, row.pin_hash)) {
        throw new Error("Invalid PIN.");
    }

    return user;
}

function requireAdmin(userId) {
    const user = findById(userId);

    if (!user.active) {
        throw new Error("User is not active.");
    }

    if (user.role !== "ADMIN") {
        throw new Error("Admin authorization is required.");
    }

    return user;
}

module.exports = {
    findById,
    findByUsername,
    verifyPassword,
    verifyPin,
    requireAdmin
};
