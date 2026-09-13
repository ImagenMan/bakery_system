-- 021_inventory_ledger.sql
--
-- Inventory Ledger
--
-- Inventory is tracked as immutable movements against a production item.
--
-- Positive quantity_delta = inventory received.
-- Negative quantity_delta = inventory consumed.
--
-- The ledger is intentionally append-only. Current inventory is derived
-- from the sum of quantity_delta rather than stored as a mutable balance.

CREATE TABLE inventory_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    production_item_id INTEGER NOT NULL,

    quantity_delta INTEGER NOT NULL,

    transaction_type TEXT NOT NULL,

    reference_type TEXT,
    reference_id INTEGER,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_inventory_transactions_item
        FOREIGN KEY (production_item_id)
        REFERENCES production_items(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_inventory_transactions_quantity
        CHECK (quantity_delta != 0),

    CONSTRAINT chk_inventory_transactions_type
        CHECK (
            transaction_type IN (
                'RECEIPT',
                'CONSUMPTION'
            )
        ),

    CONSTRAINT chk_inventory_transactions_type_quantity
        CHECK (
            (transaction_type = 'RECEIPT' AND quantity_delta > 0)
            OR
            (transaction_type = 'CONSUMPTION' AND quantity_delta < 0)
        ),

    CONSTRAINT chk_inventory_transactions_reference
        CHECK (
            (reference_type IS NULL AND reference_id IS NULL)
            OR
            (reference_type IS NOT NULL AND reference_id IS NOT NULL)
        )
);

CREATE INDEX idx_inventory_transactions_item
    ON inventory_transactions (production_item_id);

CREATE INDEX idx_inventory_transactions_reference
    ON inventory_transactions (
        reference_type,
        reference_id
    );
