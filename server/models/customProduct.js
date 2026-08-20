const db = require("../config/database");
const user = require("./user");
const { isValidMoney } = require("../utils/money");

function getCustomProductById(id) {
    if (!Number.isInteger(id)) {
        throw new Error("A valid custom product ID is required.");
    }

    return db.prepare(`
        SELECT
            id,
            name,
            price,
            description,
            active,
            created_at,
            updated_at
        FROM custom_products
        WHERE id = ?
    `).get(id);
}

function findCustomProductById(id) {
    const product = getCustomProductById(id);

    if (!product) {
        throw new Error(`Custom product ${id} not found.`);
    }

    return product;
}

function getActiveCustomProducts() {
    return db.prepare(`
        SELECT
            id,
            name,
            price,
            description,
            active,
            created_at,
            updated_at
        FROM custom_products
        WHERE active = 1
        ORDER BY name ASC, id ASC
    `).all();
}

function createCustomProduct({
    name,
    price,
    description = null,
    user_id
}) {
    user.requireAdmin(user_id);

    if (typeof name !== "string" || !name.trim()) {
        throw new Error("Custom product name is required.");
    }

    if (!isValidMoney(price)) {
        throw new Error(
            "Custom product price must be greater than zero and use no more than two decimal places."
        );
    }

    const trimmedName = name.trim();

    const result = db.prepare(`
        INSERT INTO custom_products (
            name,
            price,
            description
        )
        VALUES (?, ?, ?)
    `).run(
        trimmedName,
        price,
        description
    );

    return findCustomProductById(result.lastInsertRowid);
}

function updateCustomProduct({
    id,
    name,
    price,
    description = null,
    user_id
}) {
    user.requireAdmin(user_id);

    const existingProduct = findCustomProductById(id);

    if (typeof name !== "string" || !name.trim()) {
        throw new Error("Custom product name is required.");
    }

    if (!isValidMoney(price)) {
        throw new Error(
            "Custom product price must be greater than zero and use no more than two decimal places."
        );
    }

    const trimmedName = name.trim();

    db.prepare(`
        UPDATE custom_products
        SET
            name = ?,
            price = ?,
            description = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `).run(
        trimmedName,
        price,
        description,
        existingProduct.id
    );

    return findCustomProductById(id);
}

function setCustomProductActive({
    id,
    active,
    user_id
}) {
    user.requireAdmin(user_id);

    const existingProduct = findCustomProductById(id);

    if (active !== 0 && active !== 1) {
        throw new Error("Active status must be 0 or 1.");
    }

    db.prepare(`
        UPDATE custom_products
        SET
            active = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `).run(
        active,
        existingProduct.id
    );

    return findCustomProductById(id);
}

module.exports = {
    getCustomProductById,
    findCustomProductById,
    getActiveCustomProducts,
    createCustomProduct,
    updateCustomProduct,
    setCustomProductActive
};
