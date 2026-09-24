-- ==========================================
-- Order Pickup Ready
-- Records whether Counter has confirmed
-- that the preorder is ready for handoff.
-- ==========================================

ALTER TABLE orders
ADD COLUMN pickup_ready INTEGER NOT NULL DEFAULT 0
CHECK (pickup_ready IN (0, 1));
