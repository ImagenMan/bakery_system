const bcrypt = require("bcryptjs");

const USER_ROLES = [
    "ADMIN",
    "COUNTER"
];

const USER_LANGUAGES = [
    "ENGLISH",
    "SPANISH",
    "BILINGUAL"
];

const BCRYPT_ROUNDS = 12;

function createUserModel(db) {

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

    function findActiveByRole(role) {
        if (
            typeof role !== "string" ||
            !role.trim()
        ) {
            throw new Error(
                "A valid user role is required."
            );
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
            WHERE role = ?
                AND active = 1
            ORDER BY name ASC, id ASC
        `).all(role.trim());
    }

    function listUsers() {
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
            ORDER BY active DESC, name ASC, id ASC
        `).all();
    }

    function validateName(name) {
        if (
            typeof name !== "string" ||
            !name.trim()
        ) {
            throw new Error("User name is required.");
        }

        return name.trim();
    }

    function validateRole(role) {
        if (
            typeof role !== "string" ||
            !USER_ROLES.includes(role.trim())
        ) {
            throw new Error("Invalid user role.");
        }

        return role.trim();
    }

    function validateLanguage(language) {
        if (
            typeof language !== "string" ||
            !USER_LANGUAGES.includes(language.trim())
        ) {
            throw new Error("Invalid user language.");
        }

        return language.trim();
    }

    function validateUsername(username) {
        if (
            typeof username !== "string" ||
            !username.trim()
        ) {
            throw new Error("Username is required.");
        }

        return username.trim();
    }

    function validatePassword(password) {
        if (
            typeof password !== "string" ||
            password.length < 8
        ) {
            throw new Error(
                "Password must be at least 8 characters."
            );
        }

        return password;
    }

    function validatePin(pin) {
        if (
            typeof pin !== "string" ||
            !/^\d{4}$/.test(pin)
        ) {
            throw new Error("PIN must be exactly 4 digits.");
        }

        return pin;
    }

    function hashPassword(password) {
        return bcrypt.hashSync(
            validatePassword(password),
            BCRYPT_ROUNDS
        );
    }

    function hashPin(pin) {
        return bcrypt.hashSync(
            validatePin(pin),
            BCRYPT_ROUNDS
        );
    }

    function createUser({
        name,
        username = null,
        password = null,
        pin = null,
        role,
        language = "ENGLISH",
        active = true
    }) {
        const cleanName =
            validateName(name);

        const cleanRole =
            validateRole(role);

        const cleanLanguage =
            validateLanguage(language);

        const cleanUsername =
            username === null
                ? null
                : validateUsername(username);

        if (
            cleanRole === "ADMIN" &&
            (!cleanUsername || password === null)
        ) {
            throw new Error(
                "Admin users require a username and password."
            );
        }

        if (
            cleanRole === "COUNTER" &&
            pin === null
        ) {
            throw new Error(
                "Counter users require a PIN."
            );
        }

        if (
            cleanUsername &&
            findByUsername(cleanUsername)
        ) {
            throw new Error("Username is already in use.");
        }

        const passwordHash =
            cleanRole === "ADMIN"
                ? hashPassword(password)
                : null;

        const pinHash =
            cleanRole === "COUNTER"
                ? hashPin(pin)
                : null;

        const storedUsername =
            cleanRole === "ADMIN"
                ? cleanUsername
                : null;

        const result =
            db.prepare(`
                INSERT INTO users (
                    name,
                    role,
                    language,
                    active,
                    username,
                    password_hash,
                    pin_hash,
                    updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `).run(
                cleanName,
                cleanRole,
                cleanLanguage,
                active ? 1 : 0,
                storedUsername,
                passwordHash,
                pinHash
            );

        return findById(result.lastInsertRowid);
    }

    function updateUser(
        id,
        {
            name,
            username,
            role,
            language,
            active
        }
    ) {
        if (!Number.isInteger(id)) {
            throw new Error("A valid user ID is required.");
        }

        const existingUser =
            findById(id);

        if (role !== undefined) {
            throw new Error(
                "User role cannot be changed."
            );
        }

        const cleanName =
            name === undefined
                ? existingUser.name
                : validateName(name);

        const cleanUsername =
            username === undefined
                ? existingUser.username
                : (
                    username === null
                        ? null
                        : validateUsername(username)
                );

        const cleanLanguage =
            language === undefined
                ? existingUser.language
                : validateLanguage(language);

        const cleanActive =
            active === undefined
                ? existingUser.active
                : active
                    ? 1
                    : 0;

        if (
            cleanUsername &&
            cleanUsername !== existingUser.username
        ) {
            const usernameOwner =
                findByUsername(cleanUsername);

            if (
                usernameOwner &&
                usernameOwner.id !== id
            ) {
                throw new Error(
                    "Username is already in use."
                );
            }
        }

        const credentialState =
            db.prepare(`
                SELECT
                    password_hash,
                    pin_hash
                FROM users
                WHERE id = ?
            `).get(id);

        if (
            existingUser.role === "COUNTER" &&
            cleanUsername
        ) {
            throw new Error(
                "Counter users cannot have a username."
            );
        }

        if (
            existingUser.role === "ADMIN" &&
            !cleanUsername
        ) {
            throw new Error(
                "Admin users require a username."
            );
        }

        if (
            existingUser.role === "ADMIN" &&
            !credentialState?.password_hash
        ) {
            throw new Error(
                "Admin users require a password."
            );
        }

        if (
            existingUser.role === "COUNTER" &&
            cleanActive &&
            !credentialState?.pin_hash
        ) {
            throw new Error(
                "Active Counter users require a PIN."
            );
        }

        if (
            existingUser.role === "ADMIN" &&
            existingUser.active &&
            !cleanActive
        ) {
            const activeAdminCount =
                db.prepare(`
                    SELECT COUNT(*) AS count
                    FROM users
                    WHERE role = 'ADMIN'
                        AND active = 1
                `).get().count;

            if (activeAdminCount <= 1) {
                throw new Error(
                    "The last active Admin cannot be deactivated."
                );
            }
        }

        db.prepare(`
            UPDATE users
            SET
                name = ?,
                username = ?,
                language = ?,
                active = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            cleanName,
            cleanUsername,
            cleanLanguage,
            cleanActive,
            id
        );

        return findById(id);
    }

    function setPassword(id, password) {
        if (!Number.isInteger(id)) {
            throw new Error("A valid user ID is required.");
        }

        const existingUser =
            findById(id);

        if (existingUser.role !== "ADMIN") {
            throw new Error(
                "Password credentials are only available for Admin users."
            );
        }

        db.prepare(`
            UPDATE users
            SET
                password_hash = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            hashPassword(password),
            id
        );

        return findById(id);
    }

    function setPin(id, pin) {
        if (!Number.isInteger(id)) {
            throw new Error("A valid user ID is required.");
        }

        const existingUser =
            findById(id);

        if (existingUser.role !== "COUNTER") {
            throw new Error(
                "PIN credentials are only available for Counter users."
            );
        }

        db.prepare(`
            UPDATE users
            SET
                pin_hash = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            hashPin(pin),
            id
        );

        return findById(id);
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
            throw new Error(
                "Password authentication is not configured for this user."
            );
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
            throw new Error(
                "PIN authentication is not configured for this user."
            );
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

    return {
        findById,
        findByUsername,
        findActiveByRole,
        listUsers,
        createUser,
        updateUser,
        setPassword,
        setPin,
        verifyPassword,
        verifyPin,
        requireAdmin
    };
}

const db = require("../config/database");

module.exports = createUserModel(db);
module.exports.createUserModel = createUserModel;
