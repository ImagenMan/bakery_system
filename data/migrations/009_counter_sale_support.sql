-- ==========================================
-- Migration: 009_counter_sale_support
-- Purpose:
-- Allow counter sales to optionally have a customer.
-- Preserve existing order/payment structure.
-- ==========================================

PRAGMA foreign_keys = OFF;

CREATE TABLE orders_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    order_number TEXT NOT NULL UNIQUE,

    customer_id INTEGER,

    order_type TEXT NOT NULL DEFAULT 'PREORDER'
    CHECK (
        order_type IN (
            'PREORDER',
            'COUNTER_SALE'
        )
    ),

    status TEXT NOT NULL DEFAULT 'NEW',

    payment_status TEXT NOT NULL DEFAULT 'UNPAID'
    CHECK (payment_status IN ('UNPAID', 'PARTIAL', 'PAID')),

    total_amount NUMERIC NOT NULL DEFAULT 0
        CHECK (total_amount >= 0),

    amount_paid NUMERIC NOT NULL DEFAULT 0
        CHECK (
            amount_paid >= 0
            AND amount_paid <= total_amount
        ),

    pickup_date DATE,

    pickup_time TEXT,

    delivery INTEGER NOT NULL DEFAULT 0
        CHECK (delivery IN (0, 1)),

    delivery_address TEXT,

    notes TEXT,

    created_by INTEGER,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id)
        REFERENCES customers(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

INSERT INTO orders_new (
    id,
    order_number,
    customer_id,
    order_type,
    status,
    payment_status,
    total_amount,
    amount_paid,
    pickup_date,
    pickup_time,
    delivery,
    delivery_address,
    notes,
    created_by,
    created_at,
    updated_at
)
SELECT
    id,
    order_number,
    customer_id,
    order_type,
    status,
    payment_status,
    total_amount,
    amount_paid,
    pickup_date,
    pickup_time,
    delivery,
    delivery_address,
    notes,
    created_by,
    created_at,
    updated_at
FROM orders;

DROP TABLE orders;

ALTER TABLE orders_new RENAME TO orders;

CREATE TRIGGER orders_payment_status_insert
BEFORE INSERT ON orders
FOR EACH ROW
WHEN NEW.payment_status NOT IN ('UNPAID', 'PARTIAL', 'PAID')
BEGIN
    SELECT RAISE(
        ABORT,
        'Invalid payment status.'
    );
END;

CREATE TRIGGER orders_payment_status_update
BEFORE UPDATE OF payment_status ON orders
FOR EACH ROW
WHEN NEW.payment_status NOT IN ('UNPAID', 'PARTIAL', 'PAID')
BEGIN
    SELECT RAISE(
        ABORT,
        'Invalid payment status.'
    );
END;

CREATE TRIGGER orders_payment_amount_insert
BEFORE INSERT ON orders
FOR EACH ROW
WHEN NEW.amount_paid > NEW.total_amount
BEGIN
    SELECT RAISE(
        ABORT,
        'Amount paid cannot exceed order total.'
    );
END;

CREATE TRIGGER orders_payment_amount_update
BEFORE UPDATE OF amount_paid, total_amount ON orders
FOR EACH ROW
WHEN NEW.amount_paid > NEW.total_amount
BEGIN
    SELECT RAISE(
        ABORT,
        'Amount paid cannot exceed order total.'
    );
END;

PRAGMA foreign_keys = ON;
