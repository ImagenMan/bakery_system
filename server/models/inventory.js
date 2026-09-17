function createInventoryModel(db) {

    function validatePositiveInteger(value, fieldName) {
        if (!Number.isInteger(value) || value <= 0) {
            throw new Error(
                `${fieldName} must be a positive integer.`
            );
        }
    }

    function validateQuantityDelta(value) {
        if (!Number.isInteger(value) || value === 0) {
            throw new Error(
                "Inventory quantity delta must be a non-zero integer."
            );
        }
    }

    function validateTransactionType(transaction_type) {
        if (
            transaction_type !== "RECEIPT" &&
            transaction_type !== "CONSUMPTION" &&
            transaction_type !== "WASTE"
        ) {
            throw new Error(
                "Inventory transaction type must be RECEIPT, CONSUMPTION, or WASTE."
            );
        }
    }

    function validateReference(
        reference_type,
        reference_id
    ) {
        const hasType = reference_type !== null &&
            reference_type !== undefined;

        const hasId = reference_id !== null &&
            reference_id !== undefined;

        if (hasType !== hasId) {
            throw new Error(
                "Inventory transaction reference type and ID must be provided together."
            );
        }

        if (
            hasId &&
            (!Number.isInteger(reference_id) || reference_id <= 0)
        ) {
            throw new Error(
                "Inventory reference ID must be a positive integer."
            );
        }
    }

    function getInventoryTransactionById(id) {
        if (!Number.isInteger(id) || id <= 0) {
            throw new Error(
                "A valid inventory transaction ID is required."
            );
        }

        return db.prepare(`
            SELECT
                it.id,
                it.production_item_id,
                it.quantity_delta,
                it.transaction_type,
                it.reference_type,
                it.reference_id,
                it.source_production_available_id,
                it.created_at
            FROM inventory_transactions it
            WHERE it.id = ?
        `).get(id);
    }

    function findInventoryTransactionById(id) {
        const transaction = getInventoryTransactionById(id);

        if (!transaction) {
            throw new Error(
                `Inventory transaction ${id} not found.`
            );
        }

        return transaction;
    }

    function getInventoryBalance(production_item_id) {
        validatePositiveInteger(
            production_item_id,
            "Production item ID"
        );

        const productionItem = db.prepare(`
            SELECT id
            FROM production_items
            WHERE id = ?
        `).get(production_item_id);

        if (!productionItem) {
            throw new Error("Production item not found.");
        }

        const result = db.prepare(`
            SELECT
                COALESCE(
                    SUM(quantity_delta),
                    0
                ) AS quantity
            FROM inventory_transactions
            WHERE production_item_id = ?
        `).get(production_item_id);

        return result.quantity;
    }

    function getInventoryTransactionsByProductionItem(
        production_item_id
    ) {
        validatePositiveInteger(
            production_item_id,
            "Production item ID"
        );

        const productionItem = db.prepare(`
            SELECT id
            FROM production_items
            WHERE id = ?
        `).get(production_item_id);

        if (!productionItem) {
            throw new Error("Production item not found.");
        }

        return db.prepare(`
            SELECT
                it.id,
                it.production_item_id,
                it.quantity_delta,
                it.transaction_type,
                it.reference_type,
                it.reference_id,
                it.source_production_available_id,
                it.created_at
            FROM inventory_transactions it
            WHERE it.production_item_id = ?
            ORDER BY
                it.created_at ASC,
                it.id ASC
        `).all(production_item_id);
    }

    function createReceipt({
        production_item_id,
        quantity,
        reference_type = null,
        reference_id = null,
        source_production_available_id = null
    }) {
        validatePositiveInteger(
            production_item_id,
            "Production item ID"
        );

        validatePositiveInteger(
            quantity,
            "Receipt quantity"
        );

        validateReference(
            reference_type,
            reference_id
        );

        if (
            source_production_available_id !== null &&
            source_production_available_id !== undefined
        ) {
            validatePositiveInteger(
                source_production_available_id,
                "Source production available ID"
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
        }

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
                "Cannot create inventory receipt for an inactive production item."
            );
        }

        if (productionItem.product_active !== 1) {
            throw new Error(
                "Cannot create inventory receipt for an inactive product."
            );
        }

        const result = db.prepare(`
            INSERT INTO inventory_transactions (
                production_item_id,
                quantity_delta,
                transaction_type,
                reference_type,
                reference_id,
                source_production_available_id
            )
            VALUES (?, ?, 'RECEIPT', ?, ?, ?)
        `).run(
            production_item_id,
            quantity,
            reference_type,
            reference_id,
            source_production_available_id
        );

        return findInventoryTransactionById(
            result.lastInsertRowid
        );
    }

    function createConsumption({
        production_item_id,
        quantity,
        reference_type = null,
        reference_id = null,
        source_production_available_id = null
    }) {
        validatePositiveInteger(production_item_id, "Production item ID");
        validatePositiveInteger(quantity, "Consumption quantity");
        validateReference(reference_type, reference_id);

        if (source_production_available_id !== null) {
            validatePositiveInteger(
                source_production_available_id,
                "Source production available ID"
            );

            const sourceLot = db.prepare(`
                SELECT
                    pa.id,
                    pp.production_item_id
                FROM production_available pa
                JOIN production_plans pp
                    ON pp.id = pa.production_plan_id
                WHERE pa.id = ?
            `).get(source_production_available_id);

            if (!sourceLot) {
                throw new Error("Source production available record not found.");
            }

            if (sourceLot.production_item_id !== production_item_id) {
                throw new Error(
                    "Source production available record does not match the production item."
                );
            }
        }

        const productionItem = db.prepare(`
            SELECT pi.id
            FROM production_items pi
            WHERE pi.id = ?
        `).get(production_item_id);

        if (!productionItem) {
            throw new Error("Production item not found.");
        }

        if (source_production_available_id !== null) {
            const sourceBalance = db.prepare(`
                SELECT
                    COALESCE(
                        SUM(quantity_delta),
                        0
                    ) AS balance
                FROM inventory_transactions
                WHERE production_item_id = ?
                    AND source_production_available_id = ?
            `).get(
                production_item_id,
                source_production_available_id
            );

            if (quantity > sourceBalance.balance) {
                throw new Error(
                    `Insufficient inventory in source lot. Available quantity is ${sourceBalance.balance}.`
                );
            }
        } else {
            const currentBalance = getInventoryBalance(production_item_id);

            if (quantity > currentBalance) {
                throw new Error(
                    `Insufficient inventory. Available quantity is ${currentBalance}.`
                );
            }
        }

        const result = db.prepare(`
            INSERT INTO inventory_transactions (
                production_item_id,
                quantity_delta,
                transaction_type,
                reference_type,
                reference_id,
                source_production_available_id
            )
            VALUES (?, ?, 'CONSUMPTION', ?, ?, ?)
        `).run(
            production_item_id,
            -quantity,
            reference_type,
            reference_id,
            source_production_available_id
        );

        return findInventoryTransactionById(result.lastInsertRowid);
    }

    function createWaste({
        source_production_available_id,
        quantity,
        state,
        reason,
        notes = null
    }) {
        const transaction = db.transaction(() => {
            validatePositiveInteger(
                source_production_available_id,
                "Source production available ID"
            );

            validatePositiveInteger(
                quantity,
                "Waste quantity"
            );

            if (state !== "FRESH" && state !== "FROZEN") {
                throw new Error(
                    "Waste state must be FRESH or FROZEN."
                );
            }

            if (
                reason !== "UNSOLD" &&
                reason !== "DAMAGED" &&
                reason !== "EXPIRED" &&
                reason !== "OTHER"
            ) {
                throw new Error(
                    "Waste reason must be UNSOLD, DAMAGED, EXPIRED, or OTHER."
                );
            }

            if (notes !== null && typeof notes !== "string") {
                throw new Error(
                    "Waste notes must be a string or null."
                );
            }

            const sourceLot = db.prepare(`
                SELECT
                    pa.id,
                    pa.production_plan_id,
                    pp.production_item_id
                FROM production_available pa
                JOIN production_plans pp
                    ON pp.id = pa.production_plan_id
                WHERE pa.id = ?
            `).get(source_production_available_id);

            if (!sourceLot) {
                throw new Error(
                    "Source production available record not found."
                );
            }

            const physicalBalance = db.prepare(`
                SELECT
                    COALESCE(
                        SUM(quantity_delta),
                        0
                    ) AS balance
                FROM inventory_transactions
                WHERE source_production_available_id = ?
            `).get(source_production_available_id).balance;

            const frozenBalance = db.prepare(`
                SELECT
                    COALESCE(
                        SUM(
                            CASE
                                WHEN action_type = 'FREEZE'
                                THEN quantity
                                WHEN action_type IN ('RELEASE', 'WASTE')
                                THEN -quantity
                                ELSE 0
                            END
                        ),
                        0
                    ) AS balance
                FROM frozen_inventory
                WHERE source_production_available_id = ?
            `).get(source_production_available_id).balance;

            const availableQuantity =
                state === "FRESH"
                    ? physicalBalance - Math.max(0, frozenBalance)
                    : Math.max(0, frozenBalance);

            if (quantity > availableQuantity) {
                throw new Error(
                    `Insufficient ${state.toLowerCase()} inventory in source lot. Available quantity is ${availableQuantity}.`
                );
            }

            const result = db.prepare(`
                INSERT INTO inventory_transactions (
                    production_item_id,
                    quantity_delta,
                    transaction_type,
                    source_production_available_id
                )
                VALUES (?, ?, 'WASTE', ?)
            `).run(
                sourceLot.production_item_id,
                -quantity,
                source_production_available_id
            );

            const inventoryTransactionId = result.lastInsertRowid;

            if (state === "FROZEN") {
                db.prepare(`
                    INSERT INTO frozen_inventory (
                        production_item_id,
                        source_production_plan_id,
                        source_production_available_id,
                        quantity,
                        action_type,
                        inventory_transaction_id
                    )
                    VALUES (?, ?, ?, ?, 'WASTE', ?)
                `).run(
                    sourceLot.production_item_id,
                    sourceLot.production_plan_id,
                    source_production_available_id,
                    quantity,
                    inventoryTransactionId
                );
            }

            db.prepare(`
                INSERT INTO inventory_waste (
                    inventory_transaction_id,
                    state,
                    reason,
                    notes
                )
                VALUES (?, ?, ?, ?)
            `).run(
                inventoryTransactionId,
                state,
                reason,
                notes
            );

            return findInventoryTransactionById(
                inventoryTransactionId
            );
        });

        return transaction();
    }

    function consumeFromAvailableLots({
        production_item_id,
        quantity,
        reference_type = null,
        reference_id = null
    }) {
        validatePositiveInteger(production_item_id, "Production item ID");
        validatePositiveInteger(quantity, "Consumption quantity");
        validateReference(reference_type, reference_id);

        const productionItem = db.prepare(`
            SELECT pi.id
            FROM production_items pi
            WHERE pi.id = ?
        `).get(production_item_id);

        if (!productionItem) {
            throw new Error("Production item not found.");
        }

        const lots = db.prepare(`
            SELECT
                pa.id AS source_production_available_id,
                pa.created_at,
                pa.available_quantity,
                (
                    COALESCE(
                        SUM(it.quantity_delta),
                        0
                    )
                    -
                    MAX(
                        0,
                        COALESCE((
                            SELECT SUM(
                                CASE
                                    WHEN fi.action_type = 'FREEZE'
                                    THEN fi.quantity
                                    WHEN fi.action_type IN ('RELEASE', 'WASTE')
                                    THEN -fi.quantity
                                    ELSE 0
                                END
                            )
                            FROM frozen_inventory fi
                            WHERE fi.source_production_available_id = pa.id
                        ), 0)
                    )
                ) AS remaining_quantity
            FROM production_available pa
            JOIN production_plans pp
                ON pp.id = pa.production_plan_id
            LEFT JOIN inventory_transactions it
                ON it.source_production_available_id = pa.id
            WHERE pp.production_item_id = ?
            GROUP BY
                pa.id,
                pa.created_at,
                pa.available_quantity
            HAVING remaining_quantity > 0
            ORDER BY pa.created_at ASC, pa.id ASC
        `).all(production_item_id);

        const totalAvailable = lots.reduce(
            (total, lot) => total + lot.remaining_quantity,
            0
        );

        if (quantity > totalAvailable) {
            throw new Error(
                `Insufficient inventory. Available quantity is ${totalAvailable}.`
            );
        }

        let remainingToConsume = quantity;
        const allocations = [];

        for (const lot of lots) {
            if (remainingToConsume === 0) {
                break;
            }

            const allocationQuantity = Math.min(
                remainingToConsume,
                lot.remaining_quantity
            );

            const transaction = createConsumption({
                production_item_id,
                quantity: allocationQuantity,
                reference_type,
                reference_id,
                source_production_available_id:
                    lot.source_production_available_id
            });

            allocations.push(transaction);
            remainingToConsume -= allocationQuantity;
        }

        return allocations;
    }

    return {
        getInventoryTransactionById,
        findInventoryTransactionById,
        getInventoryBalance,
        getInventoryTransactionsByProductionItem,
        createReceipt,
        createConsumption,
        createWaste,
        consumeFromAvailableLots
    };
}

module.exports = {
    createInventoryModel
};
