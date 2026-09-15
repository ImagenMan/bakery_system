-- 024_frozen_inventory_source_lot.sql
--
-- Identify the exact production-available inventory lot
-- from which frozen inventory was preserved.
--
-- The production plan remains recorded for provenance,
-- while source_production_available_id identifies the
-- specific inventory lot.

ALTER TABLE frozen_inventory
ADD COLUMN source_production_available_id INTEGER
REFERENCES production_available(id)
ON UPDATE CASCADE
ON DELETE RESTRICT;

CREATE INDEX idx_frozen_inventory_source_available
    ON frozen_inventory (source_production_available_id);
