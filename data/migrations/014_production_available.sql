-- 014_production_available.sql
--
-- Production execution V1
--
-- Available = quantity handed over to the counter.
-- It can never exceed the total made at the cutting stage.

CREATE TABLE production_available (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    production_plan_id INTEGER NOT NULL,

    available_quantity INTEGER NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_production_available_plan
        FOREIGN KEY (production_plan_id)
        REFERENCES production_plans(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT chk_production_available_quantity
        CHECK (available_quantity > 0)
);

CREATE INDEX idx_production_available_plan
    ON production_available (production_plan_id);
