-- ==========================================
-- Migration: 008_order_type
-- Purpose:
-- Distinguish preorders from counter sales.
-- ==========================================

ALTER TABLE orders
ADD COLUMN order_type TEXT NOT NULL DEFAULT 'PREORDER'
CHECK (
    order_type IN (
        'PREORDER',
        'COUNTER_SALE'
    )
);
