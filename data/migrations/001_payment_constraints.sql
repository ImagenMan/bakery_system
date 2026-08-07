-- ==========================================
-- Migration: 001_payment_constraints
-- Purpose: Enforce payment integrity on orders
-- ==========================================

-- Prevent invalid payment statuses on INSERT.
CREATE TRIGGER IF NOT EXISTS orders_payment_status_insert
BEFORE INSERT ON orders
FOR EACH ROW
WHEN NEW.payment_status NOT IN ('UNPAID', 'PARTIAL', 'PAID')
BEGIN
    SELECT RAISE(
        ABORT,
        'Invalid payment status.'
    );
END;


-- Prevent invalid payment statuses on UPDATE.
CREATE TRIGGER IF NOT EXISTS orders_payment_status_update
BEFORE UPDATE OF payment_status ON orders
FOR EACH ROW
WHEN NEW.payment_status NOT IN ('UNPAID', 'PARTIAL', 'PAID')
BEGIN
    SELECT RAISE(
        ABORT,
        'Invalid payment status.'
    );
END;


-- Prevent amount_paid from exceeding total_amount on INSERT.
CREATE TRIGGER IF NOT EXISTS orders_payment_amount_insert
BEFORE INSERT ON orders
FOR EACH ROW
WHEN NEW.amount_paid > NEW.total_amount
BEGIN
    SELECT RAISE(
        ABORT,
        'Amount paid cannot exceed order total.'
    );
END;


-- Prevent amount_paid from exceeding total_amount on UPDATE.
CREATE TRIGGER IF NOT EXISTS orders_payment_amount_update
BEFORE UPDATE OF amount_paid, total_amount ON orders
FOR EACH ROW
WHEN NEW.amount_paid > NEW.total_amount
BEGIN
    SELECT RAISE(
        ABORT,
        'Amount paid cannot exceed order total.'
    );
END;