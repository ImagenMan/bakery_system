const db = require("../config/database");

function isValidProductionDate(value) {
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

function validateProductionDate(production_date) {
    if (!isValidProductionDate(production_date)) {
        throw new Error(
            "Production date must be a valid date in YYYY-MM-DD format."
        );
    }
}

function validatePlannedQuantity(planned_quantity) {
    if (!Number.isInteger(planned_quantity) || planned_quantity <= 0) {
        throw new Error(
            "Planned quantity must be a positive integer."
        );
    }
}

function getProductionPlanById(id) {
    if (!Number.isInteger(id) || id <= 0) {
        throw new Error("A valid production plan ID is required.");
    }

    return db.prepare(`
        SELECT
            pp.id,
            pp.production_item_id,
            pp.production_date,
            pp.planned_quantity,
            pi.product_id,
            p.sku,
            p.name AS product_name,
            p.unit,
            pi.base_batch_quantity,
            pi.active AS production_item_active,
            p.active AS product_active,
            pp.created_at,
            pp.updated_at
        FROM production_plans pp
        JOIN production_items pi
            ON pp.production_item_id = pi.id
        JOIN products p
            ON pi.product_id = p.id
        WHERE pp.id = ?
    `).get(id);
}

function findProductionPlanById(id) {
    const plan = getProductionPlanById(id);

    if (!plan) {
        throw new Error(`Production plan ${id} not found.`);
    }

    return plan;
}

function getProductionPlanByItemAndDate(
    production_item_id,
    production_date
) {
    if (
        !Number.isInteger(production_item_id) ||
        production_item_id <= 0
    ) {
        throw new Error("A valid production item ID is required.");
    }

    validateProductionDate(production_date);

    return db.prepare(`
        SELECT
            pp.id,
            pp.production_item_id,
            pp.production_date,
            pp.planned_quantity,
            pi.product_id,
            p.sku,
            p.name AS product_name,
            p.unit,
            pi.base_batch_quantity,
            pi.active AS production_item_active,
            p.active AS product_active,
            pp.created_at,
            pp.updated_at
        FROM production_plans pp
        JOIN production_items pi
            ON pp.production_item_id = pi.id
        JOIN products p
            ON pi.product_id = p.id
        WHERE pp.production_item_id = ?
          AND pp.production_date = ?
    `).get(
        production_item_id,
        production_date
    );
}

function getProductionPlansByDate(production_date) {
    validateProductionDate(production_date);

    return db.prepare(`
        SELECT
            pp.id,
            pp.production_item_id,
            pp.production_date,
            pp.planned_quantity,
            pi.product_id,
            p.sku,
            p.name AS product_name,
            p.unit,
            pi.base_batch_quantity,
            pi.active AS production_item_active,
            p.active AS product_active,
            pp.created_at,
            pp.updated_at
        FROM production_plans pp
        JOIN production_items pi
            ON pp.production_item_id = pi.id
        JOIN products p
            ON pi.product_id = p.id
        WHERE pp.production_date = ?
        ORDER BY
            p.name ASC,
            pp.id ASC
    `).all(production_date);
}

function getProductionPlansByItem(production_item_id) {
    if (
        !Number.isInteger(production_item_id) ||
        production_item_id <= 0
    ) {
        throw new Error("A valid production item ID is required.");
    }

    return db.prepare(`
        SELECT
            pp.id,
            pp.production_item_id,
            pp.production_date,
            pp.planned_quantity,
            pi.product_id,
            p.sku,
            p.name AS product_name,
            p.unit,
            pi.base_batch_quantity,
            pi.active AS production_item_active,
            p.active AS product_active,
            pp.created_at,
            pp.updated_at
        FROM production_plans pp
        JOIN production_items pi
            ON pp.production_item_id = pi.id
        JOIN products p
            ON pi.product_id = p.id
        WHERE pp.production_item_id = ?
        ORDER BY
            pp.production_date ASC,
            pp.id ASC
    `).all(production_item_id);
}

function getTotalProduced(planId) {
    const result = db.prepare(`
        SELECT
            COALESCE(SUM(produced_quantity), 0) AS total_produced
        FROM production_outputs
        WHERE production_plan_id = ?
    `).get(planId);

    return result.total_produced;
}

function createProductionPlan({
    production_item_id,
    production_date,
    planned_quantity
}) {
    if (
        !Number.isInteger(production_item_id) ||
        production_item_id <= 0
    ) {
        throw new Error("A valid production item ID is required.");
    }

    validateProductionDate(production_date);
    validatePlannedQuantity(planned_quantity);

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
            "Cannot create a production plan for an inactive production item."
        );
    }

    if (productionItem.product_active !== 1) {
        throw new Error(
            "Cannot create a production plan for an inactive product."
        );
    }

    const existingPlan = db.prepare(`
        SELECT id
        FROM production_plans
        WHERE production_item_id = ?
          AND production_date = ?
    `).get(
        production_item_id,
        production_date
    );

    if (existingPlan) {
        throw new Error(
            "A production plan already exists for this item and date."
        );
    }

    try {
        const result = db.prepare(`
            INSERT INTO production_plans (
                production_item_id,
                production_date,
                planned_quantity
            )
            VALUES (?, ?, ?)
        `).run(
            production_item_id,
            production_date,
            planned_quantity
        );

        return findProductionPlanById(result.lastInsertRowid);

    } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            throw new Error(
                "A production plan already exists for this item and date."
            );
        }

        throw error;
    }
}

function updateProductionPlan({
    id,
    production_date,
    planned_quantity
}) {
    const existingPlan = findProductionPlanById(id);

    const newProductionDate =
        production_date !== undefined
            ? production_date
            : existingPlan.production_date;

    const newPlannedQuantity =
        planned_quantity !== undefined
            ? planned_quantity
            : existingPlan.planned_quantity;

    validateProductionDate(newProductionDate);
    validatePlannedQuantity(newPlannedQuantity);

    const totalProduced = getTotalProduced(existingPlan.id);

    if (newPlannedQuantity < totalProduced) {
        throw new Error(
            `Planned quantity cannot be less than the total already produced (${totalProduced}).`
        );
    }

    if (
        totalProduced > 0 &&
        newProductionDate !== existingPlan.production_date
    ) {
        throw new Error(
            "Production date cannot be changed after production has started."
        );
    }

    const conflictingPlan = db.prepare(`
        SELECT id
        FROM production_plans
        WHERE production_item_id = ?
          AND production_date = ?
          AND id != ?
    `).get(
        existingPlan.production_item_id,
        newProductionDate,
        existingPlan.id
    );

    if (conflictingPlan) {
        throw new Error(
            "A production plan already exists for this item and date."
        );
    }

    db.prepare(`
        UPDATE production_plans
        SET
            production_date = ?,
            planned_quantity = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `).run(
        newProductionDate,
        newPlannedQuantity,
        existingPlan.id
    );

    return findProductionPlanById(id);
}

function getProductionDemandByDate(production_date) {
    if (!production_date) {
        throw new Error("Production date is required.");
    }

    validateProductionDate(production_date);

    return db.prepare(`
        SELECT
            pi.id AS production_item_id,
            pi.product_id,
            p.sku,
            p.name AS product_name,
            p.unit,

            SUM(oi.quantity) AS demand_quantity

        FROM orders o

        JOIN order_items oi
            ON oi.order_id = o.id

        JOIN production_items pi
            ON pi.product_id = oi.product_id

        JOIN products p
            ON p.id = pi.product_id

        WHERE o.order_type = 'PREORDER'
          AND o.pickup_date = ?
          AND o.status != 'CANCELLED'
          AND pi.active = 1
          AND p.active = 1

        GROUP BY
            pi.id,
            pi.product_id,
            p.sku,
            p.name,
            p.unit

        ORDER BY
            p.name ASC
    `).all(production_date);
}

function getProductionOverviewByDate(production_date) {
    if (!production_date) {
        throw new Error("Production date is required.");
    }

    validateProductionDate(production_date);

    const rows = db.prepare(`
        SELECT
            pi.id AS production_item_id,
            pi.product_id,
            p.sku,
            p.name AS product_name,
            p.unit,

            COALESCE(d.demand_quantity, 0) AS demand_quantity,

            COALESCE(pp.planned_quantity, 0) AS planned_quantity,

            COALESCE(po.total_produced, 0) AS made_quantity,

            COALESCE(pa.total_available, 0) AS available_quantity

        FROM production_items pi

        JOIN products p
            ON p.id = pi.product_id

        LEFT JOIN (
            SELECT
                pi.id AS production_item_id,
                SUM(oi.quantity) AS demand_quantity

            FROM orders o

            JOIN order_items oi
                ON oi.order_id = o.id

            JOIN production_items pi
                ON pi.product_id = oi.product_id

            WHERE o.order_type = 'PREORDER'
              AND o.pickup_date = ?
              AND o.status != 'CANCELLED'
              AND pi.active = 1

            GROUP BY pi.id
        ) d
            ON d.production_item_id = pi.id

        LEFT JOIN production_plans pp
            ON pp.production_item_id = pi.id
           AND pp.production_date = ?

        LEFT JOIN (
            SELECT
                production_plan_id,
                SUM(produced_quantity) AS total_produced

            FROM production_outputs

            GROUP BY production_plan_id
        ) po
            ON po.production_plan_id = pp.id

        LEFT JOIN (
            SELECT
                production_plan_id,
                SUM(available_quantity) AS total_available

            FROM production_available

            GROUP BY production_plan_id
        ) pa
            ON pa.production_plan_id = pp.id

        WHERE pi.active = 1
            AND p.active = 1
            AND COALESCE(d.demand_quantity, 0) > 0

        ORDER BY
            p.name ASC,
            pi.id ASC
    `).all(
        production_date,
        production_date
    );

    return rows;
}

module.exports = {
    isValidProductionDate,
    getProductionPlanById,
    findProductionPlanById,
    getProductionPlanByItemAndDate,
    getProductionPlansByDate,
    getProductionPlansByItem,
    createProductionPlan,
    updateProductionPlan,
    getProductionDemandByDate,
    getProductionOverviewByDate
};