function createProductionItemProductMappingModel(db) {

    function validateUnitsPerSale(units_per_sale) {
        if (
            !Number.isInteger(units_per_sale) ||
            units_per_sale <= 0
        ) {
            throw new Error(
                "Units per sale must be a positive integer."
            );
        }
    }

    function getMappingById(id) {
        if (!Number.isInteger(id) || id <= 0) {
            throw new Error("A valid mapping ID is required.");
        }

        return db.prepare(`
            SELECT
                m.id,
                m.production_item_id,
                m.product_id,
                p.sku,
                p.name AS product_name,
                p.unit,
                m.units_per_sale,
                m.created_at,
                m.updated_at
            FROM production_item_product_mappings m
            JOIN products p
                ON p.id = m.product_id
            WHERE m.id = ?
        `).get(id);
    }

    function findMappingById(id) {
        const mapping = getMappingById(id);

        if (!mapping) {
            throw new Error(`Mapping ${id} not found.`);
        }

        return mapping;
    }

    function getMappingByProductId(productId) {
        if (!Number.isInteger(productId) || productId <= 0) {
            throw new Error("A valid product ID is required.");
        }

        return db.prepare(`
            SELECT
                m.id,
                m.production_item_id,
                m.product_id,
                p.sku,
                p.name AS product_name,
                p.unit,
                m.units_per_sale,
                m.created_at,
                m.updated_at
            FROM production_item_product_mappings m
            JOIN products p
                ON p.id = m.product_id
            WHERE m.product_id = ?
        `).get(productId);
    }

    function getMappingsByProductionItem(productionItemId) {
        if (
            !Number.isInteger(productionItemId) ||
            productionItemId <= 0
        ) {
            throw new Error(
                "A valid production item ID is required."
            );
        }

        return db.prepare(`
            SELECT
                m.id,
                m.production_item_id,
                m.product_id,
                p.sku,
                p.name AS product_name,
                p.unit,
                m.units_per_sale,
                m.created_at,
                m.updated_at
            FROM production_item_product_mappings m
            JOIN products p
                ON p.id = m.product_id
            WHERE m.production_item_id = ?
            ORDER BY
                p.name ASC
        `).all(productionItemId);
    }

    function getAllMappings() {
        return db.prepare(`
            SELECT
                m.id,
                m.production_item_id,
                m.product_id,
                p.sku,
                p.name AS product_name,
                p.unit,
                m.units_per_sale,
                m.created_at,
                m.updated_at
            FROM production_item_product_mappings m
            JOIN products p
                ON p.id = m.product_id
            ORDER BY
                p.name ASC
        `).all();
    }

    function createMapping({
        production_item_id,
        product_id,
        units_per_sale
    }) {
        if (
            !Number.isInteger(production_item_id) ||
            production_item_id <= 0
        ) {
            throw new Error(
                "A valid production item ID is required."
            );
        }

        if (!Number.isInteger(product_id) || product_id <= 0) {
            throw new Error("A valid product ID is required.");
        }

        validateUnitsPerSale(units_per_sale);

        const productionItem = db.prepare(`
            SELECT id
            FROM production_items
            WHERE id = ?
        `).get(production_item_id);

        if (!productionItem) {
            throw new Error("Production item not found.");
        }

        const product = db.prepare(`
            SELECT id, active
            FROM products
            WHERE id = ?
        `).get(product_id);

        if (!product) {
            throw new Error("Product not found.");
        }

        if (product.active !== 1) {
            throw new Error(
                "Cannot map an inactive product to a production item."
            );
        }

        const canonicalConflict = db.prepare(`
            SELECT id
            FROM production_items
            WHERE product_id = ?
        `).get(product_id);

        if (canonicalConflict) {
            throw new Error(
                "This product is already a canonical production item and cannot also be mapped."
            );
        }

        const existingMapping = db.prepare(`
            SELECT id
            FROM production_item_product_mappings
            WHERE product_id = ?
        `).get(product_id);

        if (existingMapping) {
            throw new Error(
                "This product is already mapped to a production item."
            );
        }

        try {
            const result = db.prepare(`
                INSERT INTO production_item_product_mappings (
                    production_item_id,
                    product_id,
                    units_per_sale
                )
                VALUES (?, ?, ?)
            `).run(
                production_item_id,
                product_id,
                units_per_sale
            );

            return findMappingById(result.lastInsertRowid);

        } catch (error) {
            if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
                throw new Error(
                    "This product is already mapped to a production item."
                );
            }

            if (error.code === "SQLITE_CONSTRAINT_TRIGGER") {
                throw new Error(
                    "This product is already a canonical production item and cannot also be mapped."
                );
            }

            throw error;
        }
    }

    function updateMappingUnitsPerSale({
        id,
        units_per_sale
    }) {
        const existingMapping = findMappingById(id);

        validateUnitsPerSale(units_per_sale);

        db.prepare(`
            UPDATE production_item_product_mappings
            SET
                units_per_sale = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            units_per_sale,
            existingMapping.id
        );

        return findMappingById(id);
    }

    function deleteMapping(id) {
        const existingMapping = findMappingById(id);

        db.prepare(`
            DELETE FROM production_item_product_mappings
            WHERE id = ?
        `).run(existingMapping.id);

        return existingMapping;
    }

    return {
        getMappingById,
        findMappingById,
        getMappingByProductId,
        getMappingsByProductionItem,
        getAllMappings,
        createMapping,
        updateMappingUnitsPerSale,
        deleteMapping
    };
}

module.exports = {
    createProductionItemProductMappingModel
};
