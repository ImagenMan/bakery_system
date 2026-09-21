-- ==========================================
-- Order Item Set Asides
-- Records quantities of order items physically
-- set aside for customer pickup.
-- ==========================================

CREATE TABLE IF NOT EXISTS order_item_set_asides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    order_item_id INTEGER NOT NULL,

    quantity NUMERIC NOT NULL
        CHECK (quantity > 0),

    set_aside_by INTEGER,

    set_aside_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    notes TEXT,

    FOREIGN KEY (order_item_id)
        REFERENCES order_items(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    FOREIGN KEY (set_aside_by)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

ALTER TABLE order_items
ADD COLUMN decorator_priority INTEGER NOT NULL DEFAULT 0
CHECK (decorator_priority IN (0, 1));
