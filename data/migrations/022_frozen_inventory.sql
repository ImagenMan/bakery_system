-- 022_frozen_inventory.sql
--
-- Explicit carry-forward inventory.
--
-- A frozen quantity is not a new receipt and does not consume inventory.
-- It identifies existing inventory that has been intentionally preserved
-- for use after the source production date.
--
-- The application must verify that:
--   1. the production item uses CARRY_FORWARD behavior
--   2. the source production plan belongs to that production item
--   3. the quantity being frozen is actually available to freeze

CREATE TABLE frozen_inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    production_item_id INTEGER NOT NULL,

    source_production_plan_id INTEGER NOT NULL,

    quantity INTEGER NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_frozen_inventory_item
        FOREIGN KEY (production_item_id)
        REFERENCES production_items(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_frozen_inventory_plan
        FOREIGN KEY (source_production_plan_id)
        REFERENCES production_plans(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_frozen_inventory_quantity
        CHECK (quantity > 0)
);

CREATE INDEX idx_frozen_inventory_item
    ON frozen_inventory (production_item_id);

CREATE INDEX idx_frozen_inventory_source_plan
    ON frozen_inventory (source_production_plan_id);
