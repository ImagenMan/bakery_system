-- 026_waste_loss_ledger.sql
--
-- Waste / Loss inventory movements.
--
-- WASTE is a terminal negative physical inventory movement.
-- Every WASTE transaction must identify its source production-available lot.
--
-- Each WASTE transaction has a corresponding inventory_waste detail row.
--
-- Frozen waste is represented by:
--   1. a WASTE movement in inventory_transactions
--   2. a WASTE movement in frozen_inventory
--
-- The frozen WASTE row links directly to the physical WASTE transaction.
--
-- Existing inventory history is preserved unchanged.

CREATE TABLE inventory_transactions_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    production_item_id INTEGER NOT NULL,

    quantity_delta INTEGER NOT NULL,

    transaction_type TEXT NOT NULL,

    reference_type TEXT,
    reference_id INTEGER,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    source_production_available_id INTEGER
        REFERENCES production_available(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

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
                'CONSUMPTION',
                'WASTE'
            )
        ),

    CONSTRAINT chk_inventory_transactions_type_quantity
        CHECK (
            (transaction_type = 'RECEIPT' AND quantity_delta > 0)
            OR
            (transaction_type IN ('CONSUMPTION', 'WASTE')
                AND quantity_delta < 0)
        ),

    CONSTRAINT chk_inventory_transactions_reference
        CHECK (
            (reference_type IS NULL AND reference_id IS NULL)
            OR
            (reference_type IS NOT NULL AND reference_id IS NOT NULL)
        ),

    CONSTRAINT chk_inventory_transactions_waste_source
        CHECK (
            transaction_type != 'WASTE'
            OR source_production_available_id IS NOT NULL
        )
);

INSERT INTO inventory_transactions_new (
    id,
    production_item_id,
    quantity_delta,
    transaction_type,
    reference_type,
    reference_id,
    created_at,
    source_production_available_id
)
SELECT
    id,
    production_item_id,
    quantity_delta,
    transaction_type,
    reference_type,
    reference_id,
    created_at,
    source_production_available_id
FROM inventory_transactions;

DROP TABLE inventory_transactions;

ALTER TABLE inventory_transactions_new
RENAME TO inventory_transactions;

CREATE INDEX idx_inventory_transactions_item
    ON inventory_transactions (production_item_id);

CREATE INDEX idx_inventory_transactions_reference
    ON inventory_transactions (
        reference_type,
        reference_id
    );

CREATE INDEX idx_inventory_transactions_source_lot
    ON inventory_transactions (
        source_production_available_id
    );


CREATE TABLE frozen_inventory_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    production_item_id INTEGER NOT NULL,

    source_production_plan_id INTEGER NOT NULL,

    quantity INTEGER NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    source_production_available_id INTEGER
        REFERENCES production_available(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    action_type TEXT NOT NULL DEFAULT 'FREEZE',

    inventory_transaction_id INTEGER
        REFERENCES inventory_transactions(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_frozen_inventory_item
        FOREIGN KEY (production_item_id)
        REFERENCES production_items(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_frozen_inventory_plan
        FOREIGN KEY (source_production_plan_id)
        REFERENCES production_plans(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_frozen_inventory_transaction
        FOREIGN KEY (inventory_transaction_id)
        REFERENCES inventory_transactions(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_frozen_inventory_quantity
        CHECK (quantity > 0),

    CONSTRAINT chk_frozen_inventory_action_type
        CHECK (
            action_type IN (
                'FREEZE',
                'RELEASE',
                'WASTE'
            )
        ),

    CONSTRAINT chk_frozen_inventory_waste_transaction
        CHECK (
            (
                action_type != 'WASTE'
                AND inventory_transaction_id IS NULL
            )
            OR
            (
                action_type = 'WASTE'
                AND inventory_transaction_id IS NOT NULL
            )
        ),

    CONSTRAINT uq_frozen_inventory_transaction
        UNIQUE (inventory_transaction_id)
);

INSERT INTO frozen_inventory_new (
    id,
    production_item_id,
    source_production_plan_id,
    quantity,
    created_at,
    source_production_available_id,
    action_type,
    inventory_transaction_id
)
SELECT
    id,
    production_item_id,
    source_production_plan_id,
    quantity,
    created_at,
    source_production_available_id,
    action_type,
    NULL
FROM frozen_inventory;

DROP TABLE frozen_inventory;

ALTER TABLE frozen_inventory_new
RENAME TO frozen_inventory;

CREATE INDEX idx_frozen_inventory_item
    ON frozen_inventory (production_item_id);

CREATE INDEX idx_frozen_inventory_source_plan
    ON frozen_inventory (source_production_plan_id);

CREATE INDEX idx_frozen_inventory_source_available
    ON frozen_inventory (source_production_available_id);

CREATE INDEX idx_frozen_inventory_transaction
    ON frozen_inventory (inventory_transaction_id);


CREATE TABLE inventory_waste (
    inventory_transaction_id INTEGER PRIMARY KEY,

    state TEXT NOT NULL,

    reason TEXT NOT NULL,

    notes TEXT,

    CONSTRAINT fk_inventory_waste_transaction
        FOREIGN KEY (inventory_transaction_id)
        REFERENCES inventory_transactions(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_inventory_waste_state
        CHECK (
            state IN (
                'FRESH',
                'FROZEN'
            )
        ),

    CONSTRAINT chk_inventory_waste_reason
        CHECK (
            reason IN (
                'UNSOLD',
                'DAMAGED',
                'EXPIRED',
                'OTHER'
            )
        )
);
