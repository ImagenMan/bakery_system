-- 015_simplify_production_tracking.sql
--
-- Simplifies production tracking:
--
-- production_outputs = MADE at cutting stage
-- production_available = AVAILABLE when handed to counter
--
-- Removes the obsolete FINISHED concept.

DROP TABLE IF EXISTS production_finishes;

CREATE TABLE production_outputs_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    production_plan_id INTEGER NOT NULL,

    produced_quantity INTEGER NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_production_outputs_plan
        FOREIGN KEY (production_plan_id)
        REFERENCES production_plans(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT chk_production_outputs_produced
        CHECK (produced_quantity > 0)
);

INSERT INTO production_outputs_new (
    id,
    production_plan_id,
    produced_quantity,
    created_at
)
SELECT
    id,
    production_plan_id,
    produced_quantity,
    created_at
FROM production_outputs;

DROP TABLE production_outputs;

ALTER TABLE production_outputs_new
RENAME TO production_outputs;

CREATE INDEX idx_production_outputs_plan
    ON production_outputs (production_plan_id);