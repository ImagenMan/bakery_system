ALTER TABLE order_item_pickups
ADD COLUMN idempotency_key TEXT;

CREATE UNIQUE INDEX idx_order_item_pickups_idempotency_key
ON order_item_pickups (idempotency_key)
WHERE idempotency_key IS NOT NULL;
