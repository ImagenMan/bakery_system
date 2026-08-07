ALTER TABLE order_items
ADD COLUMN production_status TEXT NOT NULL DEFAULT 'PENDING'
CHECK (
    production_status IN (
        'PENDING',
        'IN_PROGRESS',
        'READY',
        'COMPLETED'
    )
);