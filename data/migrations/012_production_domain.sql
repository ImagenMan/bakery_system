-- 012_production_domain.sql
--
-- Production Domain V1
--
-- Adds:
--   production_items
--   production_plans
--   production_outputs
--   production_supply
--
-- Existing order/fulfillment tables are intentionally unchanged.

CREATE TABLE production_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    product_id INTEGER NOT NULL,

    base_batch_quantity INTEGER NOT NULL,

    active INTEGER NOT NULL DEFAULT 1,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_production_items_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT uq_production_items_product
        UNIQUE (product_id),

    CONSTRAINT chk_production_items_batch_quantity
        CHECK (base_batch_quantity > 0),

    CONSTRAINT chk_production_items_active
        CHECK (active IN (0, 1))
);


CREATE TABLE production_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    production_item_id INTEGER NOT NULL,

    production_date TEXT NOT NULL,

    planned_quantity INTEGER NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_production_plans_item
        FOREIGN KEY (production_item_id)
        REFERENCES production_items(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT uq_production_plans_item_date
        UNIQUE (production_item_id, production_date),

    CONSTRAINT chk_production_plans_quantity
        CHECK (planned_quantity > 0)
);


CREATE TABLE production_outputs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    production_plan_id INTEGER NOT NULL,

    produced_quantity INTEGER NOT NULL,

    finished_quantity INTEGER NOT NULL DEFAULT 0,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_production_outputs_plan
        FOREIGN KEY (production_plan_id)
        REFERENCES production_plans(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT chk_production_outputs_produced
        CHECK (produced_quantity > 0),

    CONSTRAINT chk_production_outputs_finished
        CHECK (finished_quantity >= 0),

    CONSTRAINT chk_production_outputs_finished_not_exceeding_produced
        CHECK (finished_quantity <= produced_quantity)
);


CREATE TABLE production_supply (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    production_item_id INTEGER NOT NULL,

    quantity INTEGER NOT NULL,

    supply_date TEXT NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_production_supply_item
        FOREIGN KEY (production_item_id)
        REFERENCES production_items(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT uq_production_supply_item_date
        UNIQUE (production_item_id, supply_date),

    CONSTRAINT chk_production_supply_quantity
        CHECK (quantity > 0)
);


-- Production UI primarily queries plans by production date.
CREATE INDEX idx_production_plans_date
    ON production_plans (production_date);


-- Outputs are normally retrieved by production plan.
CREATE INDEX idx_production_outputs_plan
    ON production_outputs (production_plan_id);


-- Supply is normally retrieved by production item/date.
CREATE INDEX idx_production_supply_item
    ON production_supply (production_item_id);