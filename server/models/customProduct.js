const userModel = require("./user");
const { isValidMoney } = require("../utils/money");

function createCustomProductModel(
    db,
    authorizationUser = userModel.createUserModel(db)
) {
    const user = authorizationUser;

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

    function findCustomProductById(id) {
        const product = getCustomProductById(id);

        if (!product) {
            throw new Error(`Custom product ${id} not found.`);
        }

        return product;
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

        const result = db.prepare(`
            INSERT INTO custom_products (
                name,
                price,
                description
            )
            VALUES (?, ?, ?)
        `).run(
            name.trim(),
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

        if (!Number.isInteger(id) || id <= 0) {
            throw new Error("A valid custom product ID is required.");
        }

        if (typeof name !== "string" || !name.trim()) {
            throw new Error("Custom product name is required.");
        }

        if (!isValidMoney(price)) {
            throw new Error(
                "Custom product price must be greater than zero and use no more than two decimal places."
            );
        }

        const existing = db.prepare(`
            SELECT id
            FROM custom_products
            WHERE id = ?
        `).get(id);

        if (!existing) {
            throw new Error("Custom product not found.");
        }

        db.prepare(`
            UPDATE custom_products
            SET
                name = ?,
                price = ?,
                description = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            name.trim(),
            price,
            description,
            id
        );

        return findCustomProductById(id);
    }

    function setCustomProductActive({
        id,
        active,
        user_id
    }) {
        user.requireAdmin(user_id);

        if (!Number.isInteger(id) || id <= 0) {
            throw new Error("A valid custom product ID is required.");
        }

        if (active !== 0 && active !== 1) {
            throw new Error("Active status must be 0 or 1.");
        }

        const existing = db.prepare(`
            SELECT id
            FROM custom_products
            WHERE id = ?
        `).get(id);

        if (!existing) {
            throw new Error("Custom product not found.");
        }

        db.prepare(`
            UPDATE custom_products
            SET
                active = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(active, id);

        return findCustomProductById(id);
    }

    return {
        getActiveCustomProducts,
        getCustomProductById,
        findCustomProductById,
        createCustomProduct,
        updateCustomProduct,
        setCustomProductActive
    };
}

module.exports = {
    createCustomProductModel
};