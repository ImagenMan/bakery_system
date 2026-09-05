CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    code TEXT NOT NULL UNIQUE,

    name TEXT NOT NULL UNIQUE,

    description TEXT,

    display_order INTEGER DEFAULT 0,

    active INTEGER NOT NULL DEFAULT 1,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    sku TEXT NOT NULL UNIQUE,

    category_id INTEGER NOT NULL,

    name TEXT NOT NULL,

    description TEXT,

    price NUMERIC NOT NULL,

    unit TEXT NOT NULL DEFAULT 'each',

    display_order INTEGER DEFAULT 0,

    active INTEGER NOT NULL DEFAULT 1,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);
CREATE TABLE contact_methods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL UNIQUE,

    code TEXT NOT NULL UNIQUE,

    display_order INTEGER DEFAULT 0,

    active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE product_availability (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    product_id INTEGER NOT NULL,

    day_of_week INTEGER NOT NULL
        CHECK (day_of_week BETWEEN 0 AND 6),

    active INTEGER NOT NULL DEFAULT 1,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    UNIQUE (product_id, day_of_week)
);
CREATE TABLE customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL,

    phone TEXT,

    contact_method_id INTEGER,

    preferred_language TEXT NOT NULL DEFAULT 'BILINGUAL',

    address TEXT,

    notes TEXT,

    active INTEGER NOT NULL DEFAULT 1,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (contact_method_id)
        REFERENCES contact_methods(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL,

    role TEXT NOT NULL DEFAULT 'COUNTER',

    language TEXT NOT NULL DEFAULT 'ENGLISH',

    active INTEGER NOT NULL DEFAULT 1,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
, username TEXT, password_hash TEXT, pin_hash TEXT);
CREATE TABLE schema_migrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            migration TEXT NOT NULL UNIQUE,
            applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
CREATE TABLE order_item_pickups (
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
CREATE UNIQUE INDEX idx_users_username
ON users(username)
WHERE username IS NOT NULL;
CREATE TABLE IF NOT EXISTS "orders" (
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
CREATE TABLE custom_products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL CHECK (price >= 0),
    description TEXT,
    active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS "order_items" (
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
CREATE TABLE production_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    product_id INTEGER NOT NULL,

    base_batch_quantity INTEGER NOT NULL,

    active INTEGER NOT NULL DEFAULT 1,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_production_items_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT uq_production_items_product
        UNIQUE (product_id),

    CONSTRAINT chk_production_items_batch_quantity
        CHECK (base_batch_quantity > 0),

    CONSTRAINT chk_production_items_active
        CHECK (active IN (0, 1))
);
CREATE TABLE production_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    production_item_id INTEGER NOT NULL,

    production_date TEXT NOT NULL,

    planned_quantity INTEGER NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_production_plans_item
        FOREIGN KEY (production_item_id)
        REFERENCES production_items(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT uq_production_plans_item_date
        UNIQUE (production_item_id, production_date),

    CONSTRAINT chk_production_plans_quantity
        CHECK (planned_quantity > 0)
);
CREATE TABLE production_supply (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    production_item_id INTEGER NOT NULL,

    quantity INTEGER NOT NULL,

    supply_date TEXT NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_production_supply_item
        FOREIGN KEY (production_item_id)
        REFERENCES production_items(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT uq_production_supply_item_date
        UNIQUE (production_item_id, supply_date),

    CONSTRAINT chk_production_supply_quantity
        CHECK (quantity > 0)
);
CREATE INDEX idx_production_plans_date
    ON production_plans (production_date);
CREATE INDEX idx_production_supply_item
    ON production_supply (production_item_id);
CREATE TABLE production_available (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    production_plan_id INTEGER NOT NULL,

    available_quantity INTEGER NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_production_available_plan
        FOREIGN KEY (production_plan_id)
        REFERENCES production_plans(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT chk_production_available_quantity
        CHECK (available_quantity > 0)
);
CREATE INDEX idx_production_available_plan
    ON production_available (production_plan_id);
CREATE TABLE IF NOT EXISTS "production_outputs" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    production_plan_id INTEGER NOT NULL,

    produced_quantity INTEGER NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_production_outputs_plan
        FOREIGN KEY (production_plan_id)
        REFERENCES production_plans(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT chk_production_outputs_produced
        CHECK (produced_quantity > 0)
);
CREATE INDEX idx_production_outputs_plan
    ON production_outputs (production_plan_id);
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
