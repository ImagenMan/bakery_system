-- 020_production_item_inventory_behavior.sql
--
-- Production Item Inventory Behavior
--
-- Defines whether unsold production can cross the production-day
-- boundary as intentionally carried-forward inventory.
--
-- SAME_DAY:
--   Unsold quantity does not automatically become next-day inventory.
--
-- CARRY_FORWARD:
--   Explicitly frozen quantity may become available on future days.
--
-- Existing production items default to SAME_DAY. This is the
-- conservative/safe behavior until a production item is explicitly
-- configured as carry-forward eligible.

ALTER TABLE production_items
ADD COLUMN inventory_behavior TEXT NOT NULL DEFAULT 'SAME_DAY'
CHECK (
    inventory_behavior IN (
        'SAME_DAY',
        'CARRY_FORWARD'
    )
);
