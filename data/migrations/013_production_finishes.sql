-- 013_production_finishes.sql
--
-- Production Domain V2
--
-- Adds:
--   production_finishes
--
-- Finishing is recorded separately from production output so
-- finishing can happen after production has already been recorded.

CREATE TABLE production_finishes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    production_plan_id INTEGER NOT NULL,

    finished_quantity INTEGER NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_production_finishes_plan
        FOREIGN KEY (production_plan_id)
        REFERENCES production_plans(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT chk_production_finishes_quantity
        CHECK (finished_quantity > 0)
);


-- Finishes are normally retrieved by production plan.
CREATE INDEX idx_production_finishes_plan
    ON production_finishes (production_plan_id);