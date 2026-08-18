const db = require("../config/database");
const user = require("./user");
const { isValidMoney } = require("../utils/money");

function getAllProducts() {
    return db.prepare(`
        SELECT
            p.id,
            p.sku,
            p.name,
            p.description,
            p.price,
            p.unit,
            p.display_order,
            p.active,
            c.id AS category_id,
            c.code AS category_code,
            c.name AS category_name
        FROM products p
        JOIN categories c
            ON p.category_id = c.id
        WHERE p.active = 1
        ORDER BY
            c.display_order,
            p.display_order,
            p.name
    `).all();
}

function getProductById(id) {
    return db.prepare(`
        SELECT
            p.id,
            p.sku,
            p.name,
            p.description,
            p.price,
            p.unit,
            p.display_order,
            p.active,
            c.id AS category_id,
            c.code AS category_code,
            c.name AS category_name
        FROM products p
        JOIN categories c
            ON p.category_id = c.id
        WHERE p.id = ?
    `).get(id);
}

function getProductsByCategory(categoryId) {
    return db.prepare(`
        SELECT
            p.id,
            p.sku,
            p.name,
            p.description,
            p.price,
            p.unit,
            p.display_order,
            p.active
        FROM products p
        WHERE p.category_id = ?
          AND p.active = 1
        ORDER BY
            p.display_order,
            p.name
    `).all(categoryId);
}

function getAllCategories() {
    return db.prepare(`
        SELECT
            id,
            code,
            name,
            description,
            display_order,
            active
        FROM categories
        WHERE active = 1
        ORDER BY
            display_order,
            name
    `).all();
}

function createProduct({
    sku,
    category_id,
    name,
    description = null,
    price,
    unit = "each",
    display_order = 0,
    user_id
}) {
    user.requireAdmin(user_id);

    if (typeof sku !== "string" || !sku.trim()) {
        throw new Error("SKU is required.");
    }

    if (typeof name !== "string" || !name.trim()) {
        throw new Error("Product name is required.");
    }

    if (!Number.isInteger(category_id) || category_id <= 0) {
        throw new Error("A valid category is required.");
    }

    if (!isValidMoney(price)) {
        throw new Error(
            "Product price must be greater than zero and use no more than two decimal places."
        );
    }

    if (typeof unit !== "string" || !unit.trim()) {
        throw new Error("Product unit is required.");
    }

    if (!Number.isInteger(display_order)) {
        throw new Error("Display order must be an integer.");
    }

    const category = db.prepare(`
        SELECT id
        FROM categories
        WHERE id = ?
          AND active = 1
    `).get(category_id);

    if (!category) {
        throw new Error("Category not found or inactive.");
    }

    try {
        const result = db.prepare(`
            INSERT INTO products (
                sku,
                category_id,
                name,
                description,
                price,
                unit,
                display_order
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
            sku.trim(),
            category_id,
            name.trim(),
            description,
            price,
            unit.trim(),
            display_order
        );

        return getProductById(result.lastInsertRowid);

    } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            throw new Error("SKU already exists.");
        }

        throw error;
    }
}

function updateProduct({
    id,
    sku,
    category_id,
    name,
    description = null,
    price,
    unit = "each",
    display_order = 0,
    user_id
}) {
    user.requireAdmin(user_id);

    if (!Number.isInteger(id) || id <= 0) {
        throw new Error("A valid product ID is required.");
    }

    if (typeof sku !== "string" || !sku.trim()) {
        throw new Error("SKU is required.");
    }

    if (typeof name !== "string" || !name.trim()) {
        throw new Error("Product name is required.");
    }

    if (!Number.isInteger(category_id) || category_id <= 0) {
        throw new Error("A valid category is required.");
    }

    if (!isValidMoney(price)) {
        throw new Error(
            "Product price must be greater than zero and use no more than two decimal places."
        );
    }

    if (typeof unit !== "string" || !unit.trim()) {
        throw new Error("Product unit is required.");
    }

    if (!Number.isInteger(display_order)) {
        throw new Error("Display order must be an integer.");
    }

    const category = db.prepare(`
        SELECT id
        FROM categories
        WHERE id = ?
          AND active = 1
    `).get(category_id);

    if (!category) {
        throw new Error("Category not found or inactive.");
    }

    const product = db.prepare(`
        SELECT id
        FROM products
        WHERE id = ?
    `).get(id);

    if (!product) {
        throw new Error("Product not found.");
    }

    try {
        db.prepare(`
            UPDATE products
            SET
                sku = ?,
                category_id = ?,
                name = ?,
                description = ?,
                price = ?,
                unit = ?,
                display_order = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            sku.trim(),
            category_id,
            name.trim(),
            description,
            price,
            unit.trim(),
            display_order,
            id
        );

    } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            throw new Error("SKU already exists.");
        }

        throw error;
    }

    return getProductById(id);
}

function setProductActive({
    id,
    active,
    user_id
}) {
    user.requireAdmin(user_id);

    if (!Number.isInteger(id) || id <= 0) {
        throw new Error("A valid product ID is required.");
    }

    if (active !== 0 && active !== 1) {
        throw new Error("Active must be 0 or 1.");
    }

    const product = db.prepare(`
        SELECT id
        FROM products
        WHERE id = ?
    `).get(id);

    if (!product) {
        throw new Error("Product not found.");
    }

    db.prepare(`
        UPDATE products
        SET
            active = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `).run(active, id);

    return getProductById(id);
}

module.exports = {
    getAllProducts,
    getProductById,
    getProductsByCategory,
    getAllCategories,
    createProduct,
    updateProduct,
    setProductActive
};