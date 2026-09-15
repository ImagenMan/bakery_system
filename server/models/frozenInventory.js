function createFrozenInventoryModel(db) {

    function validatePositiveInteger(value, fieldName) {
        if (!Number.isInteger(value) || value <= 0) {
            throw new Error(
                `${fieldName} must be a positive integer.`
            );
        }
    }

    function getFrozenInventoryBySourceAvailableId(
        source_production_available_id
    ) {
        validatePositiveInteger(
            source_production_available_id,
            "Source production available ID"
        );

        return db.prepare(`
            SELECT
                fi.id,
                fi.production_item_id,
                fi.source_production_plan_id,
                fi.source_production_available_id,
                fi.quantity,
                fi.created_at
            FROM frozen_inventory fi
            WHERE fi.source_production_available_id = ?
            ORDER BY
                fi.created_at ASC,
                fi.id ASC
        `).all(source_production_available_id);
    }

    function getFrozenQuantityBySourceAvailableId(
        source_production_available_id
    ) {
        validatePositiveInteger(
            source_production_available_id,
            "Source production available ID"
        );

        const result = db.prepare(`
            SELECT
                COALESCE(
                    SUM(quantity),
                    0
                ) AS frozen_quantity
            FROM frozen_inventory
            WHERE source_production_available_id = ?
        `).get(source_production_available_id);

        return result.frozen_quantity;
    }

    function createFrozenInventory({
        source_production_available_id,
        quantity
    }) {
        const transaction = db.transaction(() => {
            validatePositiveInteger(
                source_production_available_id,
                "Source production available ID"
            );

            validatePositiveInteger(
                quantity,
                "Frozen quantity"
            );

            const sourceAvailable = db.prepare(`
                SELECT
                    id,
                    production_plan_id,
                    available_quantity
                FROM production_available
                WHERE id = ?
            `).get(source_production_available_id);

            if (!sourceAvailable) {
                throw new Error(
                    "Source production available record not found."
                );
            }

            const sourcePlan = db.prepare(`
                SELECT
                    id,
                    production_item_id
                FROM production_plans
                WHERE id = ?
            `).get(sourceAvailable.production_plan_id);

            if (!sourcePlan) {
                throw new Error(
                    "Source production plan not found."
                );
            }

            const productionItem = db.prepare(`
                SELECT
                    id,
                    inventory_behavior
                FROM production_items
                WHERE id = ?
            `).get(sourcePlan.production_item_id);

            if (!productionItem) {
                throw new Error("Production item not found.");
            }

            if (productionItem.inventory_behavior !== "CARRY_FORWARD") {
                throw new Error(
                    "Only CARRY_FORWARD production items can have frozen inventory."
                );
            }

            const inventoryBalance = db.prepare(`
                SELECT
                    COALESCE(
                        SUM(quantity_delta),
                        0
                    ) AS inventory_balance
                FROM inventory_transactions
                WHERE source_production_available_id = ?
            `).get(source_production_available_id).inventory_balance;

            const alreadyFrozen =
                getFrozenQuantityBySourceAvailableId(
                    source_production_available_id
                );

            const quantityAvailableToFreeze =
                inventoryBalance - alreadyFrozen;

            if (quantity > quantityAvailableToFreeze) {
                throw new Error(
                    `Frozen quantity cannot exceed the remaining unfrozen inventory in source lot (${quantityAvailableToFreeze}).`
                );
            }

            const result = db.prepare(`
                INSERT INTO frozen_inventory (
                    production_item_id,
                    source_production_plan_id,
                    source_production_available_id,
                    quantity
                )
                VALUES (?, ?, ?, ?)
            `).run(
                productionItem.id,
                sourcePlan.id,
                source_production_available_id,
                quantity
            );

            return db.prepare(`
                SELECT
                    fi.id,
                    fi.production_item_id,
                    fi.source_production_plan_id,
                    fi.source_production_available_id,
                    fi.quantity,
                    fi.created_at
                FROM frozen_inventory fi
                WHERE fi.id = ?
            `).get(result.lastInsertRowid);
        });

        return transaction();
    }

        return {
            getFrozenInventoryBySourceAvailableId,
            getFrozenQuantityBySourceAvailableId,
            createFrozenInventory
        };
}

module.exports = {
    createFrozenInventoryModel
};
