function createProductionOutputModel(db) {

function validatePositiveInteger(value, fieldName) {
    if (!Number.isInteger(value) || value <= 0) {
        throw new Error(
            `${fieldName} must be a positive integer.`
        );
    }
}

function getProductionOutputById(id) {
    if (!Number.isInteger(id) || id <= 0) {
        throw new Error(
            "A valid production output ID is required."
        );
    }

    return db.prepare(`
        SELECT
            po.id,
            po.production_plan_id,
            po.produced_quantity,
            pp.production_item_id,
            pp.production_date,
            pp.planned_quantity,
            pi.product_id,
            p.sku,
            p.name AS product_name,
            p.unit,
            po.created_at
        FROM production_outputs po
        JOIN production_plans pp
            ON po.production_plan_id = pp.id
        JOIN production_items pi
            ON pp.production_item_id = pi.id
        JOIN products p
            ON pi.product_id = p.id
        WHERE po.id = ?
    `).get(id);
}

function findProductionOutputById(id) {
    const output = getProductionOutputById(id);

    if (!output) {
        throw new Error(
            `Production output ${id} not found.`
        );
    }

    return output;
}

function getProductionOutputsByPlanId(production_plan_id) {
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
            produced_quantity,
            created_at
        FROM production_outputs
        WHERE production_plan_id = ?
        ORDER BY
            created_at ASC,
            id ASC
    `).all(production_plan_id);
}

function getProductionTotals(production_plan_id) {
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
            COALESCE(
                SUM(produced_quantity),
                0
            ) AS total_produced
        FROM production_outputs
        WHERE production_plan_id = ?
    `).get(production_plan_id);
}

function createProductionOutput({
    production_plan_id,
    produced_quantity
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
        produced_quantity,
        "Produced quantity"
    );

    const plan = db.prepare(`
        SELECT
            pp.id,
            pp.production_item_id,
            pp.production_date,
            pp.planned_quantity,
            pi.active AS production_item_active,
            p.active AS product_active
        FROM production_plans pp
        JOIN production_items pi
            ON pp.production_item_id = pi.id
        JOIN products p
            ON pi.product_id = p.id
        WHERE pp.id = ?
    `).get(production_plan_id);

    if (!plan) {
        throw new Error("Production plan not found.");
    }

    /*
     * Production outputs represent historical production.
     * The total made may exceed the original plan.
     */

    const result = db.prepare(`
        INSERT INTO production_outputs (
            production_plan_id,
            produced_quantity
        )
        VALUES (?, ?)
    `).run(
        production_plan_id,
        produced_quantity
    );

    return findProductionOutputById(
        result.lastInsertRowid
    );
}

    return {
        getProductionOutputById,
        findProductionOutputById,
        getProductionOutputsByPlanId,
        getProductionTotals,
        createProductionOutput
    };
}

module.exports = {
    createProductionOutputModel
};