-- 018_training_sticky_production_reference.sql
--
-- Adds Sticky to the Training Production reference items.
--
-- Idempotent:
--   - Existing production_items are left untouched.
--   - Product is resolved by SKU, not hard-coded product ID.
--
-- This migration intentionally creates NO production plans,
-- outputs, available quantities, or supply records.

INSERT INTO production_items (
    product_id,
    base_batch_quantity
)
SELECT
    p.id,
    50
FROM products p
WHERE p.sku = 'CIN-STK'
  AND NOT EXISTS (
      SELECT 1
      FROM production_items pi
      WHERE pi.product_id = p.id
  );
