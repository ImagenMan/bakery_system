"use strict";

function isValidProductionDate(value) {
    if (
        typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
        return false;
    }

    const date = new Date(`${value}T00:00:00.000Z`);

    return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
    );
}

function validateProductionDate(value) {
    if (!isValidProductionDate(value)) {
        throw new Error(
            "Production date must be a valid date in YYYY-MM-DD format."
        );
    }

    return value;
}

function validateId(value, fieldName) {
    if (!Number.isSafeInteger(value) || value <= 0) {
        throw new Error(`${fieldName} must be a positive integer.`);
    }

    return value;
}

function validateDisplayOrder(value) {
    if (!Number.isSafeInteger(value) || value < 0) {
        throw new Error(
            "Display order must be a nonnegative integer."
        );
    }

    return value;
}

function validatePlannedBatches(value) {
    if (!Number.isSafeInteger(value) || value < 0) {
        throw new Error(
            "Planned batches must be a nonnegative integer."
        );
    }

    return value;
}

function normalizeFamilyName(value) {
    if (typeof value !== "string" || !value.trim()) {
        throw new Error("Production family name is required.");
    }

    return value.trim();
}

function normalizeDescription(value) {
    if (value === undefined || value === null) {
        return null;
    }

    if (typeof value !== "string") {
        throw new Error(
            "Production family description must be text."
        );
    }

    const description = value.trim();

    return description || null;
}

function normalizeActive(value) {
    if (value === true || value === 1) {
        return 1;
    }

    if (value === false || value === 0) {
        return 0;
    }

    throw new Error("Active must be true or false.");
}

function createProductionFamilyModel(db) {
    if (!db || typeof db.prepare !== "function") {
        throw new Error(
            "A valid database connection is required."
        );
    }

    const findProductionFamilyByIdStatement = db.prepare(`
        SELECT
            id,
            name,
            description,
            display_order,
            active,
            created_at,
            updated_at
        FROM production_families
        WHERE id = ?
    `);

    function findProductionFamilyById(id) {
        validateId(id, "Production family ID");

        return findProductionFamilyByIdStatement.get(id) || null;
    }

    function getProductionFamilyById(id) {
        const family = findProductionFamilyById(id);

        if (!family) {
            throw new Error("Production family not found.");
        }

        return family;
    }

    function getProductionFamilies({
        includeInactive = false
    } = {}) {
        if (typeof includeInactive !== "boolean") {
            throw new Error(
                "includeInactive must be true or false."
            );
        }

        if (includeInactive) {
            return db.prepare(`
                SELECT
                    id,
                    name,
                    description,
                    display_order,
                    active,
                    created_at,
                    updated_at
                FROM production_families
                ORDER BY display_order, name, id
            `).all();
        }

        return db.prepare(`
            SELECT
                id,
                name,
                description,
                display_order,
                active,
                created_at,
                updated_at
            FROM production_families
            WHERE active = 1
            ORDER BY display_order, name, id
        `).all();
    }

    function createProductionFamily({
        name,
        description = null,
        display_order = 0
    }) {
        const normalizedName = normalizeFamilyName(name);
        const normalizedDescription =
            normalizeDescription(description);

        validateDisplayOrder(display_order);

        const result = db.prepare(`
            INSERT INTO production_families (
                name,
                description,
                display_order
            )
            VALUES (?, ?, ?)
        `).run(
            normalizedName,
            normalizedDescription,
            display_order
        );

        return getProductionFamilyById(Number(result.lastInsertRowid));
    }

    function updateProductionFamily({
        id,
        name,
        description = null,
        display_order = 0
    }) {
        validateId(id, "Production family ID");

        const normalizedName = normalizeFamilyName(name);
        const normalizedDescription =
            normalizeDescription(description);

        validateDisplayOrder(display_order);

        const result = db.prepare(`
            UPDATE production_families
            SET
                name = ?,
                description = ?,
                display_order = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            normalizedName,
            normalizedDescription,
            display_order,
            id
        );

        if (result.changes === 0) {
            throw new Error("Production family not found.");
        }

        return getProductionFamilyById(id);
    }

    function setProductionFamilyActive(id, active) {
        validateId(id, "Production family ID");

        const normalizedActive = normalizeActive(active);

        const result = db.prepare(`
            UPDATE production_families
            SET
                active = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(normalizedActive, id);

        if (result.changes === 0) {
            throw new Error("Production family not found.");
        }

        return getProductionFamilyById(id);
    }

    function assignProductionItemToFamily(
        productionItemId,
        productionFamilyId
    ) {
        validateId(
            productionItemId,
            "Production item ID"
        );

        const item = db.prepare(`
            SELECT id
            FROM production_items
            WHERE id = ?
        `).get(productionItemId);

        if (!item) {
            throw new Error("Production item not found.");
        }

        if (productionFamilyId !== null) {
            validateId(
                productionFamilyId,
                "Production family ID"
            );

            const family = findProductionFamilyById(
                productionFamilyId
            );

            if (!family) {
                throw new Error("Production family not found.");
            }

            if (family.active !== 1) {
                throw new Error(
                    "Cannot assign an item to an inactive family."
                );
            }
        }

        db.prepare(`
            UPDATE production_items
            SET family_id = ?
            WHERE id = ?
        `).run(productionFamilyId, productionItemId);

        return db.prepare(`
            SELECT
                id,
                product_id,
                family_id
            FROM production_items
            WHERE id = ?
        `).get(productionItemId);
    }

    function getProductionFamilyPlansByDate(productionDate) {
        validateProductionDate(productionDate);

        return db.prepare(`
            SELECT
                pf.id AS production_family_id,
                pf.name AS family_name,
                pf.description AS family_description,
                pf.display_order,
                pf.active AS family_active,
                pfp.id AS family_plan_id,
                pfp.production_date,
                pfp.planned_batches,
                pfp.created_at AS plan_created_at,
                pfp.updated_at AS plan_updated_at
            FROM production_families pf
            LEFT JOIN production_family_plans pfp
                ON pfp.production_family_id = pf.id
                AND pfp.production_date = ?
            WHERE
                pf.active = 1
                OR pfp.id IS NOT NULL
            ORDER BY pf.display_order, pf.name, pf.id
        `).all(productionDate);
    }

    function saveProductionFamilyPlan({
        production_family_id,
        production_date,
        planned_batches
    }) {
        validateId(
            production_family_id,
            "Production family ID"
        );

        validateProductionDate(production_date);
        validatePlannedBatches(planned_batches);

        const family = findProductionFamilyById(
            production_family_id
        );

        if (!family) {
            throw new Error("Production family not found.");
        }

        if (family.active !== 1) {
            throw new Error(
                "Cannot save an estimate for an inactive family."
            );
        }

        db.prepare(`
            INSERT INTO production_family_plans (
                production_family_id,
                production_date,
                planned_batches
            )
            VALUES (?, ?, ?)
            ON CONFLICT (
                production_family_id,
                production_date
            )
            DO UPDATE SET
                planned_batches = excluded.planned_batches,
                updated_at = CURRENT_TIMESTAMP
        `).run(
            production_family_id,
            production_date,
            planned_batches
        );

        return db.prepare(`
            SELECT
                id,
                production_family_id,
                production_date,
                planned_batches,
                created_at,
                updated_at
            FROM production_family_plans
            WHERE
                production_family_id = ?
                AND production_date = ?
        `).get(production_family_id, production_date);
    }

    return {
        findProductionFamilyById,
        getProductionFamilyById,
        getProductionFamilies,
        createProductionFamily,
        updateProductionFamily,
        setProductionFamilyActive,
        assignProductionItemToFamily,
        getProductionFamilyPlansByDate,
        saveProductionFamilyPlan
    };
}

module.exports = {
    createProductionFamilyModel,
    isValidProductionDate,
    validateProductionDate
};
