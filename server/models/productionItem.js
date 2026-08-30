const db = require("../config/database");

function getProductionItemById(id) {
    if (!Number.isInteger(id) || id <= 0) {
        throw new Error("A valid production item ID is required.");
    }

    return db.prepare(`
        SELECT
            pi.id,
            pi.product_id,
            p.sku,
            p.name AS product_name,
            p.unit,
            pi.base_batch_quantity,
            pi.active,
            pi.created_at,
            pi.updated_at
        FROM production_items pi
        JOIN products p
            ON pi.product_id = p.id
        WHERE pi.id = ?
    `).get(id);
}

function findProductionItemById(id) {
    const productionItem = getProductionItemById(id);

    if (!productionItem) {
        throw new Error(`Production item ${id} not found.`);
    }

    return productionItem;
}

function getProductionItemByProductId(productId) {
    if (!Number.isInteger(productId) || productId <= 0) {
        throw new Error("A valid product ID is required.");
    }

    return db.prepare(`
        SELECT
            pi.id,
            pi.product_id,
            p.sku,
            p.name AS product_name,
            p.unit,
            pi.base_batch_quantity,
            pi.active,
            pi.created_at,
            pi.updated_at
        FROM production_items pi
        JOIN products p
            ON pi.product_id = p.id
        WHERE pi.product_id = ?
    `).get(productId);
}

function getActiveProductionItems() {
    return db.prepare(`
        SELECT
            pi.id,
            pi.product_id,
            p.sku,
            p.name AS product_name,
            p.unit,
            pi.base_batch_quantity,
            pi.active,
            pi.created_at,
            pi.updated_at
        FROM production_items pi
        JOIN products p
            ON pi.product_id = p.id
        WHERE pi.active = 1
          AND p.active = 1
        ORDER BY
            p.name ASC,
            pi.id ASC
    `).all();
}

function validateBaseBatchQuantity(quantity) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new Error(
            "Base batch quantity must be a positive integer."
        );
    }
}

function createProductionItem({
    product_id,
    base_batch_quantity
}) {
    if (!Number.isInteger(product_id) || product_id <= 0) {
        throw new Error("A valid product ID is required.");
    }

    validateBaseBatchQuantity(base_batch_quantity);

    const product = db.prepare(`
        SELECT
            id,
            active
        FROM products
        WHERE id = ?
    `).get(product_id);

    if (!product) {
        throw new Error("Product not found.");
    }

    if (product.active !== 1) {
        throw new Error("Cannot create production item for an inactive product.");
    }

    const existingProductionItem = db.prepare(`
        SELECT id
        FROM production_items
        WHERE product_id = ?
    `).get(product_id);

    if (existingProductionItem) {
        throw new Error(
            "A production item already exists for this product."
        );
    }

    try {
        const result = db.prepare(`
            INSERT INTO production_items (
                product_id,
                base_batch_quantity
            )
            VALUES (?, ?)
        `).run(
            product_id,
            base_batch_quantity
        );

        return findProductionItemById(result.lastInsertRowid);

    } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            throw new Error(
                "A production item already exists for this product."
            );
        }

        throw error;
    }
}

function updateProductionItem({
    id,
    base_batch_quantity
}) {
    const existingProductionItem = findProductionItemById(id);

    validateBaseBatchQuantity(base_batch_quantity);

    db.prepare(`
        UPDATE production_items
        SET
            base_batch_quantity = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `).run(
        base_batch_quantity,
        existingProductionItem.id
    );

    return findProductionItemById(id);
}

function setProductionItemActive({
    id,
    active
}) {
    const existingProductionItem = findProductionItemById(id);

    if (active !== 0 && active !== 1) {
        throw new Error("Active status must be 0 or 1.");
    }

    db.prepare(`
        UPDATE production_items
        SET
            active = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `).run(
        active,
        existingProductionItem.id
    );

    return findProductionItemById(id);
}

module.exports = {
    getProductionItemById,
    findProductionItemById,
    getProductionItemByProductId,
    getActiveProductionItems,
    createProductionItem,
    updateProductionItem,
    setProductionItemActive
};