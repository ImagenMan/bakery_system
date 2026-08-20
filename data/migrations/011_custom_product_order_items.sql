-- ==========================================
-- Migration: 011_custom_product_order_items
-- Purpose:
-- Allow order items to reference an approved
-- admin-managed custom product.
-- ==========================================

PRAGMA foreign_keys = OFF;

CREATE TABLE order_items_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    order_id INTEGER NOT NULL,

    product_id INTEGER,

    custom_product_id INTEGER,

    custom_name TEXT,

    quantity NUMERIC NOT NULL
        CHECK (quantity > 0),

    unit_price NUMERIC NOT NULL
        CHECK (unit_price >= 0),

    notes TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    production_status TEXT NOT NULL DEFAULT 'PENDING'
        CHECK (
            production_status IN (
                'PENDING',
                'IN_PROGRESS',
                'READY',
                'COMPLETED'
            )
        ),

    CHECK (
        product_id IS NOT NULL
        OR custom_product_id IS NOT NULL
        OR custom_name IS NOT NULL
    ),

    FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    FOREIGN KEY (custom_product_id)
        REFERENCES custom_products(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

INSERT INTO order_items_new (
    id,
    order_id,
    product_id,
    custom_product_id,
    custom_name,
    quantity,
    unit_price,
    notes,
    created_at,
    production_status
)
SELECT
    id,
    order_id,
    product_id,
    NULL,
    custom_name,
    quantity,
    unit_price,
    notes,
    created_at,
    production_status
FROM order_items;

DROP TABLE order_items;

ALTER TABLE order_items_new
RENAME TO order_items;

PRAGMA foreign_keys = ON;
