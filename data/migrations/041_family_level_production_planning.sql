-- 041_family_level_production_planning.sql
--
-- Family-Level Production Planning
--
-- Allows bakers to estimate production workload by family
-- before deciding exact quantities for individual items.
--
-- Family estimates are planning records only. They do not
-- create production plans, production output, or inventory.

CREATE TABLE production_families (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL UNIQUE,

    description TEXT,

    display_order INTEGER NOT NULL DEFAULT 0,

    active INTEGER NOT NULL DEFAULT 1,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_production_families_active
        CHECK (active IN (0, 1))
);


ALTER TABLE production_items
ADD COLUMN family_id INTEGER
REFERENCES production_families(id)
ON UPDATE CASCADE
ON DELETE RESTRICT;


CREATE INDEX idx_production_items_family
    ON production_items (family_id);


CREATE TABLE production_family_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    production_family_id INTEGER NOT NULL,

    production_date TEXT NOT NULL,

    planned_batches INTEGER NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_production_family_plans_family
        FOREIGN KEY (production_family_id)
        REFERENCES production_families(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT uq_production_family_plans_family_date
        UNIQUE (production_family_id, production_date),

    CONSTRAINT chk_production_family_plans_batches
        CHECK (planned_batches >= 0),

    CONSTRAINT chk_production_family_plans_date
        CHECK (
            length(production_date) = 10
            AND production_date GLOB
                '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
        )
);


CREATE INDEX idx_production_family_plans_date
    ON production_family_plans (production_date);
