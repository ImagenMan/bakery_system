-- ==========================================
-- Order Item Pickups
-- Records each time part or all of an order
-- item is picked up by a customer.
-- ==========================================

CREATE TABLE IF NOT EXISTS order_item_pickups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    order_item_id INTEGER NOT NULL,

    quantity NUMERIC NOT NULL
        CHECK (quantity > 0),

    picked_up_by INTEGER,

    picked_up_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    notes TEXT,

    FOREIGN KEY (order_item_id)
        REFERENCES order_items(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    FOREIGN KEY (picked_up_by)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);