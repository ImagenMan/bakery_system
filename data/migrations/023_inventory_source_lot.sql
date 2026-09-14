-- 023_inventory_source_lot.sql
--
-- Identify the production-available inventory lot associated with
-- an inventory transaction.
--
-- A production_available row represents a discrete handoff from
-- production into inventory and therefore acts as the source lot.
--
-- Existing inventory transactions remain valid with NULL here.
-- New production inventory transactions may identify their source lot.

ALTER TABLE inventory_transactions
ADD COLUMN source_production_available_id INTEGER
REFERENCES production_available(id)
ON UPDATE CASCADE
ON DELETE RESTRICT;

CREATE INDEX idx_inventory_transactions_source_lot
    ON inventory_transactions (source_production_available_id);
