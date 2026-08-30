const db = require("../config/database");

function isValidSupplyDate(value) {
    if (typeof value !== "string") {
        return false;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }

    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
    );
}

function validateSupplyDate(supply_date) {
    if (!isValidSupplyDate(supply_date)) {
        throw new Error(
            "Supply date must be a valid date in YYYY-MM-DD format."
        );
    }
}

function validateQuantity(quantity) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new Error(
            "Supply quantity must be a positive integer."
        );
    }
}

function getProductionSupplyById(id) {
    if (!Number.isInteger(id) || id <= 0) {
        throw new Error("A valid production supply ID is required.");
    }

    return db.prepare(`
        SELECT
            ps.id,
            ps.production_item_id,
            ps.quantity,
            ps.supply_date,
            pi.product_id,
            p.sku,
            p.name AS product_name,
            p.unit,
            pi.base_batch_quantity,
            pi.active AS production_item_active,
            p.active AS product_active,
            ps.created_at,
            ps.updated_at
        FROM production_supply ps
        JOIN production_items pi
            ON ps.production_item_id = pi.id
        JOIN products p
            ON pi.product_id = p.id
        WHERE ps.id = ?
    `).get(id);
}

function findProductionSupplyById(id) {
    const supply = getProductionSupplyById(id);

    if (!supply) {
        throw new Error(`Production supply ${id} not found.`);
    }

    return supply;
}

function getProductionSupplyByItemAndDate(
    production_item_id,
    supply_date
) {
    if (
        !Number.isInteger(production_item_id) ||
        production_item_id <= 0
    ) {
        throw new Error("A valid production item ID is required.");
    }

    validateSupplyDate(supply_date);

    return db.prepare(`
        SELECT
            ps.id,
            ps.production_item_id,
            ps.quantity,
            ps.supply_date,
            pi.product_id,
            p.sku,
            p.name AS product_name,
            p.unit,
            pi.base_batch_quantity,
            pi.active AS production_item_active,
            p.active AS product_active,
            ps.created_at,
            ps.updated_at
        FROM production_supply ps
        JOIN production_items pi
            ON ps.production_item_id = pi.id
        JOIN products p
            ON pi.product_id = p.id
        WHERE ps.production_item_id = ?
          AND ps.supply_date = ?
    `).get(
        production_item_id,
        supply_date
    );
}

function getProductionSupplyByDate(supply_date) {
    validateSupplyDate(supply_date);

    return db.prepare(`
        SELECT
            ps.id,
            ps.production_item_id,
            ps.quantity,
            ps.supply_date,
            pi.product_id,
            p.sku,
            p.name AS product_name,
            p.unit,
            pi.base_batch_quantity,
            pi.active AS production_item_active,
            p.active AS product_active,
            ps.created_at,
            ps.updated_at
        FROM production_supply ps
        JOIN production_items pi
            ON ps.production_item_id = pi.id
        JOIN products p
            ON pi.product_id = p.id
        WHERE ps.supply_date = ?
        ORDER BY
            p.name ASC,
            ps.id ASC
    `).all(supply_date);
}

function createProductionSupply({
    production_item_id,
    quantity,
    supply_date
}) {
    if (
        !Number.isInteger(production_item_id) ||
        production_item_id <= 0
    ) {
        throw new Error("A valid production item ID is required.");
    }

    validateQuantity(quantity);
    validateSupplyDate(supply_date);

    const productionItem = db.prepare(`
        SELECT
            pi.id,
            pi.active,
            p.active AS product_active
        FROM production_items pi
        JOIN products p
            ON pi.product_id = p.id
        WHERE pi.id = ?
    `).get(production_item_id);

    if (!productionItem) {
        throw new Error("Production item not found.");
    }

    if (productionItem.active !== 1) {
        throw new Error(
            "Cannot create supply for an inactive production item."
        );
    }

    if (productionItem.product_active !== 1) {
        throw new Error(
            "Cannot create supply for an inactive product."
        );
    }

    const existingSupply = db.prepare(`
        SELECT id
        FROM production_supply
        WHERE production_item_id = ?
          AND supply_date = ?
    `).get(
        production_item_id,
        supply_date
    );

    if (existingSupply) {
        throw new Error(
            "Supply already exists for this item and date."
        );
    }

    try {
        const result = db.prepare(`
            INSERT INTO production_supply (
                production_item_id,
                quantity,
                supply_date
            )
            VALUES (?, ?, ?)
        `).run(
            production_item_id,
            quantity,
            supply_date
        );

        return findProductionSupplyById(result.lastInsertRowid);

    } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            throw new Error(
                "Supply already exists for this item and date."
            );
        }

        throw error;
    }
}

function updateProductionSupply({
    id,
    quantity,
    supply_date
}) {
    const existingSupply = findProductionSupplyById(id);

    validateQuantity(quantity);
    validateSupplyDate(supply_date);

    const conflictingSupply = db.prepare(`
        SELECT id
        FROM production_supply
        WHERE production_item_id = ?
          AND supply_date = ?
          AND id != ?
    `).get(
        existingSupply.production_item_id,
        supply_date,
        existingSupply.id
    );

    if (conflictingSupply) {
        throw new Error(
            "Supply already exists for this item and date."
        );
    }

    db.prepare(`
        UPDATE production_supply
        SET
            quantity = ?,
            supply_date = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `).run(
        quantity,
        supply_date,
        existingSupply.id
    );

    return findProductionSupplyById(id);
}

module.exports = {
    isValidSupplyDate,
    getProductionSupplyById,
    findProductionSupplyById,
    getProductionSupplyByItemAndDate,
    getProductionSupplyByDate,
    createProductionSupply,
    updateProductionSupply
};