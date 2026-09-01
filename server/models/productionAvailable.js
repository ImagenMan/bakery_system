const db = require("../config/database");

function validatePositiveInteger(value, fieldName) {
    if (!Number.isInteger(value) || value <= 0) {
        throw new Error(
            `${fieldName} must be a positive integer.`
        );
    }
}

function getProductionAvailableById(id) {
    if (!Number.isInteger(id) || id <= 0) {
        throw new Error(
            "A valid production available ID is required."
        );
    }

    return db.prepare(`
        SELECT
            pa.id,
            pa.production_plan_id,
            pa.available_quantity,
            pp.production_item_id,
            pp.production_date,
            pp.planned_quantity,
            pi.product_id,
            p.sku,
            p.name AS product_name,
            p.unit,
            pa.created_at
        FROM production_available pa
        JOIN production_plans pp
            ON pa.production_plan_id = pp.id
        JOIN production_items pi
            ON pp.production_item_id = pi.id
        JOIN products p
            ON pi.product_id = p.id
        WHERE pa.id = ?
    `).get(id);
}

function findProductionAvailableById(id) {
    const available = getProductionAvailableById(id);

    if (!available) {
        throw new Error(
            `Production available ${id} not found.`
        );
    }

    return available;
}

function getProductionAvailableByPlanId(production_plan_id) {
    if (
        !Number.isInteger(production_plan_id) ||
        production_plan_id <= 0
    ) {
        throw new Error(
            "A valid production plan ID is required."
        );
    }

    const plan = db.prepare(`
        SELECT id
        FROM production_plans
        WHERE id = ?
    `).get(production_plan_id);

    if (!plan) {
        throw new Error("Production plan not found.");
    }

    return db.prepare(`
        SELECT
            id,
            production_plan_id,
            available_quantity,
            created_at
        FROM production_available
        WHERE production_plan_id = ?
        ORDER BY
            created_at ASC,
            id ASC
    `).all(production_plan_id);
}

function getAvailableTotal(production_plan_id) {
    if (
        !Number.isInteger(production_plan_id) ||
        production_plan_id <= 0
    ) {
        throw new Error(
            "A valid production plan ID is required."
        );
    }

    const plan = db.prepare(`
        SELECT id
        FROM production_plans
        WHERE id = ?
    `).get(production_plan_id);

    if (!plan) {
        throw new Error("Production plan not found.");
    }

    const result = db.prepare(`
        SELECT
            COALESCE(
                SUM(available_quantity),
                0
            ) AS total_available
        FROM production_available
        WHERE production_plan_id = ?
    `).get(production_plan_id);

    return result.total_available;
}

function createProductionAvailable({
    production_plan_id,
    available_quantity
}) {
    if (
        !Number.isInteger(production_plan_id) ||
        production_plan_id <= 0
    ) {
        throw new Error(
            "A valid production plan ID is required."
        );
    }

    validatePositiveInteger(
        available_quantity,
        "Available quantity"
    );

    const plan = db.prepare(`
        SELECT
            id
        FROM production_plans
        WHERE id = ?
    `).get(production_plan_id);

    if (!plan) {
        throw new Error("Production plan not found.");
    }

    const totalProduced = db.prepare(`
        SELECT
            COALESCE(
                SUM(produced_quantity),
                0
            ) AS total_produced
        FROM production_outputs
        WHERE production_plan_id = ?
    `).get(production_plan_id).total_produced;

    const totalAvailable = db.prepare(`
        SELECT
            COALESCE(
                SUM(available_quantity),
                0
            ) AS total_available
        FROM production_available
        WHERE production_plan_id = ?
    `).get(production_plan_id).total_available;

    if (
        totalAvailable + available_quantity >
        totalProduced
    ) {
        throw new Error(
            `Available quantity cannot exceed total made quantity (${totalProduced}).`
        );
    }

    const result = db.prepare(`
        INSERT INTO production_available (
            production_plan_id,
            available_quantity
        )
        VALUES (?, ?)
    `).run(
        production_plan_id,
        available_quantity
    );

    return findProductionAvailableById(
        result.lastInsertRowid
    );
}

module.exports = {
    getProductionAvailableById,
    findProductionAvailableById,
    getProductionAvailableByPlanId,
    getAvailableTotal,
    createProductionAvailable
};