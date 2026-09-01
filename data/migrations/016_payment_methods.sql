-- ==========================================
-- Migration: 016_payment_methods
-- Purpose: Support counter-sale payment methods
-- ==========================================

ALTER TABLE payments RENAME TO payments_old;

CREATE TABLE payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    order_id INTEGER NOT NULL,

    amount NUMERIC NOT NULL
        CHECK (amount > 0),

    payment_method TEXT NOT NULL
        CHECK (
            payment_method IN (
                'CASH',
                'CARD',
                'BANK_TRANSFER',
                'OTHER'
            )
        ),

    reference TEXT,

    recorded_by INTEGER,

    notes TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE,

    FOREIGN KEY (recorded_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);

INSERT INTO payments (
    id,
    order_id,
    amount,
    payment_method,
    reference,
    recorded_by,
    notes,
    created_at
)
SELECT
    id,
    order_id,
    amount,
    payment_method,
    reference,
    recorded_by,
    notes,
    created_at
FROM payments_old;

DROP TABLE payments_old;
