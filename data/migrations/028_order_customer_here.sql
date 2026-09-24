-- ==========================================
-- Order Customer Here
-- Records whether the customer is currently
-- present at the counter for pickup.
-- ==========================================

ALTER TABLE orders
ADD COLUMN customer_here INTEGER NOT NULL DEFAULT 0
CHECK (customer_here IN (0, 1));