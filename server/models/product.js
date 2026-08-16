const db = require("../config/database");

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

module.exports = {
    getAllProducts,
    getProductById,
    getProductsByCategory,
    getAllCategories
};