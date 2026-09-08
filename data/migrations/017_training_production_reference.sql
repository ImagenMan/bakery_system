-- 017_training_production_reference.sql
--
-- Adds the default production reference items required by
-- Training Production.
--
-- Idempotent:
--   - Existing production_items are left untouched.
--   - Products are resolved by SKU, not hard-coded product IDs.
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
WHERE p.sku = 'DON-SEN'
  AND NOT EXISTS (
      SELECT 1
      FROM production_items pi
      WHERE pi.product_id = p.id
  );

INSERT INTO production_items (
    product_id,
    base_batch_quantity
)
SELECT
    p.id,
    50
FROM products p
WHERE p.sku = 'BRD-BRIO'
  AND NOT EXISTS (
      SELECT 1
      FROM production_items pi
      WHERE pi.product_id = p.id
  );
