-- 019_production_item_product_mappings.sql
--
-- Production Item <-> Product Mapping
--
-- Problem:
--   production_items.product_id supports exactly one sellable
--   product per production item. Some sellable products are
--   really alternate packaging/sale forms of the same production
--   output (e.g. "English Muffin Pack" is a sale form of the
--   "English Muffin" production item), and the schema has no way
--   to represent that.
--
-- Adds:
--   production_item_product_mappings
--
-- A row in this table says: "this sellable product's demand
-- should be counted against this production item, at this
-- units_per_sale multiplier" -- WITHOUT changing what a
-- production item canonically is (production_items.product_id
-- is untouched and remains the canonical relationship).
--
-- Invariants enforced here:
--   - A product can have at most one mapping
--     (UNIQUE constraint on product_id).
--   - A product cannot be both a canonical production product
--     (production_items.product_id) and a mapped/alias product
--     (production_item_product_mappings.product_id) at the same
--     time. This is enforced with triggers on both tables so the
--     invariant holds regardless of insertion order, in addition
--     to any application-level checks.
--
-- This migration is schema-only. It does not populate any real
-- product mappings -- those require confirmed business decisions
-- and will be added in a later migration.

CREATE TABLE production_item_product_mappings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    production_item_id INTEGER NOT NULL,

    product_id INTEGER NOT NULL,

    units_per_sale INTEGER NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_production_item_product_mappings_item
        FOREIGN KEY (production_item_id)
        REFERENCES production_items(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_production_item_product_mappings_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    -- A product can be mapped to at most one production item.
    -- This UNIQUE constraint also supplies the index needed to
    -- look up a mapping by product_id, so no separate index on
    -- product_id is created below.
    CONSTRAINT uq_production_item_product_mappings_product
        UNIQUE (product_id),

    CONSTRAINT chk_production_item_product_mappings_units_per_sale
        CHECK (units_per_sale > 0)
);


-- Mappings are normally retrieved by production item (e.g. to list
-- every alias product feeding a given production item). This is
-- NOT covered by the UNIQUE constraint above, so it needs its own
-- index.
CREATE INDEX idx_production_item_product_mappings_item
    ON production_item_product_mappings (production_item_id);


-- ---------------------------------------------------------------
-- Cross-table double-counting guards.
--
-- A product must never be able to contribute to production demand
-- through both production_items.product_id and
-- production_item_product_mappings.product_id at once. SQLite has
-- no cross-table CHECK constraint, so this is enforced with
-- triggers on both tables (insert and update-of-product_id), as a
-- database-level backstop to the application-level checks in the
-- model layer.
-- ---------------------------------------------------------------

CREATE TRIGGER trg_prevent_mapping_for_canonical_product_insert
BEFORE INSERT ON production_item_product_mappings
FOR EACH ROW
WHEN EXISTS (
    SELECT 1
    FROM production_items
    WHERE product_id = NEW.product_id
)
BEGIN
    SELECT RAISE(ABORT, 'Product is already a canonical production item and cannot also be mapped.');
END;


CREATE TRIGGER trg_prevent_mapping_for_canonical_product_update
BEFORE UPDATE OF product_id ON production_item_product_mappings
FOR EACH ROW
WHEN EXISTS (
    SELECT 1
    FROM production_items
    WHERE product_id = NEW.product_id
)
BEGIN
    SELECT RAISE(ABORT, 'Product is already a canonical production item and cannot also be mapped.');
END;


CREATE TRIGGER trg_prevent_canonical_for_mapped_product_insert
BEFORE INSERT ON production_items
FOR EACH ROW
WHEN EXISTS (
    SELECT 1
    FROM production_item_product_mappings
    WHERE product_id = NEW.product_id
)
BEGIN
    SELECT RAISE(ABORT, 'Product is already mapped to a production item and cannot also be canonical.');
END;


CREATE TRIGGER trg_prevent_canonical_for_mapped_product_update
BEFORE UPDATE OF product_id ON production_items
FOR EACH ROW
WHEN EXISTS (
    SELECT 1
    FROM production_item_product_mappings
    WHERE product_id = NEW.product_id
)
BEGIN
    SELECT RAISE(ABORT, 'Product is already mapped to a production item and cannot also be canonical.');
END;
