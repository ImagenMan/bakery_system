-- ==========================================
-- Bakery System Database Schema
-- Version: 0.1.0
-- Last Updated: 2026-08-02
-- ==========================================

PRAGMA foreign_keys = ON;


-- ==========================================
-- Categories
-- Stores the product categories used by
-- the bakery.
-- ==========================================

CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    code TEXT NOT NULL UNIQUE,

    name TEXT NOT NULL UNIQUE,

    description TEXT,

    display_order INTEGER DEFAULT 0,

    active INTEGER NOT NULL DEFAULT 1,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


-- ==========================================
-- Products
-- Master catalog of all sellable products.
-- ==========================================

CREATE TABLE IF NOT EXISTS products (
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


-- ==========================================
-- Contact Methods
-- How customers normally contact the bakery.
-- ==========================================

CREATE TABLE IF NOT EXISTS contact_methods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL UNIQUE,

    code TEXT NOT NULL UNIQUE,

    display_order INTEGER DEFAULT 0,

    active INTEGER NOT NULL DEFAULT 1
);


-- ==========================================
-- Product Availability
-- Defines the normal days a product
-- is available.
--
-- day_of_week:
-- 0 = Sunday
-- 1 = Monday
-- 2 = Tuesday
-- 3 = Wednesday
-- 4 = Thursday
-- 5 = Friday
-- 6 = Saturday
-- ==========================================

CREATE TABLE IF NOT EXISTS product_availability (
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


-- ==========================================
-- Customers
-- Stores customer information and preferences.
-- ==========================================

CREATE TABLE IF NOT EXISTS customers (
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


-- ==========================================
-- Users
-- Bakery employees and administrators.
-- ==========================================

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'COUNTER',
    language TEXT NOT NULL DEFAULT 'ENGLISH',
    active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    username TEXT,
    password_hash TEXT,
    pin_hash TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username
ON users(username)
WHERE username IS NOT NULL;

-- ==========================================
-- Orders
-- Main customer order record.
-- ==========================================

CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    order_number TEXT NOT NULL UNIQUE,

    customer_id INTEGER NOT NULL,

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


-- ==========================================
-- Order Items
-- Individual products belonging to an order.
-- ==========================================

CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    order_id INTEGER NOT NULL,

    product_id INTEGER,

    custom_name TEXT,

    quantity NUMERIC NOT NULL
        CHECK (quantity > 0),

    unit_price NUMERIC NOT NULL
        CHECK (unit_price >= 0),

    notes TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CHECK (
        product_id IS NOT NULL
        OR custom_name IS NOT NULL
    ),

    FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- ==========================================
-- Migrations Tracker
-- 
-- ==========================================

CREATE TABLE IF NOT EXISTS schema_migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    migration TEXT NOT NULL UNIQUE,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);