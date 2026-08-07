-- ==========================================
-- Migration: 002_payment_history
-- Purpose: Store permanent payment records
-- ==========================================

CREATE TABLE payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    order_id INTEGER NOT NULL,

    amount NUMERIC NOT NULL
        CHECK (amount > 0),

    payment_method TEXT NOT NULL
        CHECK (
            payment_method IN (
                'CASH',
                'BANK_TRANSFER'
            )
        ),

    reference TEXT,

    recorded_by INTEGER,

    notes TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    FOREIGN KEY (recorded_by)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);