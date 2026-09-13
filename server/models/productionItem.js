function createProductionItemModel(db) {

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
                pi.inventory_behavior,
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

        // A product resolves to a production item either directly
        // (it *is* the canonical product for that item) or via a
        // mapping (it's an alternate sellable form of that item's
        // canonical product). A product can never be both, so
        // these two cases can't both match.
        const canonical = db.prepare(`
            SELECT
                pi.id,
                pi.product_id,
                p.sku,
                p.name AS product_name,
                p.unit,
                pi.base_batch_quantity,
                pi.active,
                pi.inventory_behavior,
                pi.created_at,
                pi.updated_at,
                1 AS units_per_sale,
                'canonical' AS resolved_via
            FROM production_items pi
            JOIN products p
                ON pi.product_id = p.id
            WHERE pi.product_id = ?
        `).get(productId);

        if (canonical) {
            return canonical;
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
                pi.inventory_behavior,
                pi.created_at,
                pi.updated_at,
                m.units_per_sale AS units_per_sale,
                'mapping' AS resolved_via
            FROM production_item_product_mappings m
            JOIN production_items pi
                ON pi.id = m.production_item_id
            JOIN products p
                ON pi.product_id = p.id
            WHERE m.product_id = ?
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
                pi.inventory_behavior,
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

    function validateInventoryBehavior(inventory_behavior) {
        if (
            inventory_behavior !== "SAME_DAY" &&
            inventory_behavior !== "CARRY_FORWARD"
        ) {
            throw new Error(
                "Inventory behavior must be SAME_DAY or CARRY_FORWARD."
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
            throw new Error(
                "Cannot create production item for an inactive product."
            );
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

        const existingMapping = db.prepare(`
            SELECT id
            FROM production_item_product_mappings
            WHERE product_id = ?
        `).get(product_id);

        if (existingMapping) {
            throw new Error(
                "This product is already mapped to another production item and cannot also be canonical."
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

            if (error.code === "SQLITE_CONSTRAINT_TRIGGER") {
                throw new Error(
                    "This product is already mapped to another production item and cannot also be canonical."
                );
            }

            throw error;
        }
    }

    function updateProductionItem({
        id,
        base_batch_quantity,
        inventory_behavior
    }) {
        const existingProductionItem = findProductionItemById(id);

        validateBaseBatchQuantity(base_batch_quantity);
        validateInventoryBehavior(inventory_behavior);

        db.prepare(`
            UPDATE production_items
            SET
                base_batch_quantity = ?,
                inventory_behavior = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            base_batch_quantity,
            inventory_behavior,
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

    return {
        getProductionItemById,
        findProductionItemById,
        getProductionItemByProductId,
        getActiveProductionItems,
        createProductionItem,
        updateProductionItem,
        setProductionItemActive
    };
}

module.exports = {
    createProductionItemModel
};