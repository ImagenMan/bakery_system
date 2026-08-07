-- ==========================================
-- Bakery System Database Seed Data
-- ==========================================


-- ==========================================
-- Categories
-- ==========================================

INSERT INTO categories (code, name, display_order)
VALUES
('DON', 'Donuts', 1),
('CIN', 'Cinnamon Rolls', 2),
('BAG', 'Bagels', 3),
('BRD', 'Bread', 4),
('ENG', 'English Muffins', 5),
('COO', 'Cookies', 6),
('DES', 'Desserts', 7),
('PRE', 'Pretzels', 8),
('PAS', 'Pastries', 9),
('PIE', 'Cakes & Pies', 10),
('SAV', 'Savory', 11),
('SPB', 'Specialty Breads', 12),
('DRK', 'Drinks', 13);


-- ==========================================
-- Contact Methods
-- ==========================================

INSERT INTO contact_methods (name, code, display_order)
VALUES
('Phone', 'PHONE', 1),
('WhatsApp', 'WHATSAPP', 2),
('Facebook', 'FACEBOOK', 3),
('Walk-in', 'WALKIN', 4);


-- ==========================================
-- Products
-- ==========================================


-- ==========================================
-- Donuts
-- ==========================================

INSERT INTO products (
    sku, category_id, name, description, price, unit, display_order
)
SELECT
    'DON-SEN',
    id,
    'Sencilla',
    'Donut sencilla',
    25,
    'each',
    1
FROM categories
WHERE code = 'DON';

INSERT INTO products (
    sku, category_id, name, description, price, unit, display_order
)
SELECT
    'DON-TOP',
    id,
    'Topping',
    'Donut con topping',
    28,
    'each',
    2
FROM categories
WHERE code = 'DON';

INSERT INTO products (
    sku, category_id, name, description, price, unit, display_order
)
SELECT
    'DON-ESP',
    id,
    'Especial',
    'Donut especial',
    30,
    'each',
    3
FROM categories
WHERE code = 'DON';

INSERT INTO products (
    sku, category_id, name, description, price, unit, display_order
)
SELECT
    'DON-CAKE',
    id,
    'Cake',
    'Cake donut',
    35,
    'each',
    4
FROM categories
WHERE code = 'DON';


-- ==========================================
-- Cinnamon Rolls
-- ==========================================

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'CIN-ROL',
    id,
    'Roles',
    38,
    'each',
    1
FROM categories
WHERE code = 'CIN';

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'CIN-STK',
    id,
    'Sticky',
    45,
    'each',
    2
FROM categories
WHERE code = 'CIN';

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'CIN-CHZ',
    id,
    'Cheesecake/Zarzamora',
    50,
    'each',
    3
FROM categories
WHERE code = 'CIN';

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'CIN-HAM',
    id,
    'Jamon/Queso Roles',
    60,
    'each',
    4
FROM categories
WHERE code = 'CIN';


-- ==========================================
-- Bagels
-- ==========================================

INSERT INTO products (
    sku, category_id, name, description, price, unit, display_order
)
SELECT
    'BAG-PLA',
    id,
    'Plain',
    'Plain bagel',
    20,
    'each',
    1
FROM categories
WHERE code = 'BAG';

INSERT INTO products (
    sku, category_id, name, description, price, unit, display_order
)
SELECT
    'BAG-SES',
    id,
    'Sesame',
    'Sesame bagel',
    20,
    'each',
    2
FROM categories
WHERE code = 'BAG';

INSERT INTO products (
    sku, category_id, name, description, price, unit, display_order
)
SELECT
    'BAG-CHE',
    id,
    'Cheddar',
    'Cheddar bagel',
    25,
    'each',
    3
FROM categories
WHERE code = 'BAG';

INSERT INTO products (
    sku, category_id, name, description, price, unit, display_order
)
SELECT
    'BAG-EVE',
    id,
    'Everything',
    'Everything bagel',
    25,
    'each',
    4
FROM categories
WHERE code = 'BAG';

INSERT INTO products (
    sku, category_id, name, description, price, unit, display_order
)
SELECT
    'BAG-POP',
    id,
    'Poppy',
    'Poppy seed bagel',
    25,
    'each',
    5
FROM categories
WHERE code = 'BAG';

INSERT INTO products (
    sku, category_id, name, description, price, unit, display_order
)
SELECT
    'BAG-JAL',
    id,
    'Jalapeño',
    'Jalapeño bagel',
    30,
    'each',
    6
FROM categories
WHERE code = 'BAG';


-- ==========================================
-- English Muffins
-- ==========================================

INSERT INTO products (
    sku, category_id, name, description, price, unit, display_order
)
SELECT
    'ENG-STD',
    id,
    'English Muffin',
    '100g English muffin',
    20,
    'each',
    1
FROM categories
WHERE code = 'ENG';

INSERT INTO products (
    sku, category_id, name, description, price, unit, display_order
)
SELECT
    'ENG-STD-6',
    id,
    'English Muffin Pack',
    'Pack of English Muffins',
    70,
    'pack',
    2
FROM categories
WHERE code = 'ENG';

INSERT INTO products (
    sku, category_id, name, description, price, unit, display_order
)
SELECT
    'ENG-ARA',
    id,
    'Aran',
    '115g English muffin',
    20,
    'each',
    3
FROM categories
WHERE code = 'ENG';

INSERT INTO products (
    sku, category_id, name, description, price, unit, display_order
)
SELECT
    'ENG-ARA-6',
    id,
    'Aran Pack',
    'Pack of Aran English Muffins',
    70,
    'pack',
    4
FROM categories
WHERE code = 'ENG';

INSERT INTO products (
    sku, category_id, name, description, price, unit, display_order
)
SELECT
    'ENG-CEM',
    id,
    'CEM',
    '115g English muffin',
    20,
    'each',
    5
FROM categories
WHERE code = 'ENG';

INSERT INTO products (
    sku, category_id, name, description, price, unit, display_order
)
SELECT
    'ENG-CEM-6',
    id,
    'CEM Pack',
    'Pack of CEM English Muffins',
    70,
    'pack',
    6
FROM categories
WHERE code = 'ENG';

INSERT INTO products (
    sku, category_id, name, description, price, unit, display_order
)
SELECT
    'ENG-INT-6',
    id,
    'Integral Pack',
    'Pack of Integral English Muffins',
    80,
    'pack',
    7
FROM categories
WHERE code = 'ENG';


-- ==========================================
-- Specialty Breads
-- ==========================================

INSERT INTO products (
    sku, category_id, name, description, price, unit, display_order
)
SELECT
    'SPB-PITA',
    id,
    'Pan Pita',
    '105g, pack of 4',
    70,
    'pack',
    1
FROM categories
WHERE code = 'SPB';

INSERT INTO products (
    sku, category_id, name, description, price, unit, display_order
)
SELECT
    'SPB-PITA-INT',
    id,
    'Pan Pita Integral',
    '105g, pack of 4',
    75,
    'pack',
    2
FROM categories
WHERE code = 'SPB';

INSERT INTO products (
    sku, category_id, name, description, price, unit, display_order
)
SELECT
    'SPB-PITA-GDE',
    id,
    'Pan Pita Grande',
    '250g, pack of 4',
    85,
    'pack',
    3
FROM categories
WHERE code = 'SPB';

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'SPB-HOAGIE',
    id,
    'Hoagie',
    25,
    'each',
    4
FROM categories
WHERE code = 'SPB';

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'SPB-CROISSANT',
    id,
    'Croissant',
    50,
    'each',
    5
FROM categories
WHERE code = 'SPB';

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'SPB-SOUPBOWL',
    id,
    'Soupbowl',
    25,
    'each',
    6
FROM categories
WHERE code = 'SPB';


-- ==========================================
-- Bread
-- ==========================================


-- ------------------------------------------
-- Hogazas
-- ------------------------------------------

INSERT INTO products (
    sku, category_id, name, description, price, unit, display_order
)
SELECT
    'BRD-HOG-CLA-L',
    id,
    'Hogaza Classic White Grande',
    'Classic White sourdough loaf',
    80,
    'each',
    1
FROM categories
WHERE code = 'BRD';

INSERT INTO products (
    sku, category_id, name, description, price, unit, display_order
)
SELECT
    'BRD-HOG-CLA-S',
    id,
    'Hogaza Classic White Chico',
    'Classic White sourdough loaf',
    40,
    'each',
    2
FROM categories
WHERE code = 'BRD';

INSERT INTO products (
    sku, category_id, name, description, price, unit, display_order
)
SELECT
    'BRD-HOG-RUS-L',
    id,
    'Hogaza Rustic White Grande',
    'Rustic White sourdough loaf',
    90,
    'each',
    3
FROM categories
WHERE code = 'BRD';

INSERT INTO products (
    sku, category_id, name, description, price, unit, display_order
)
SELECT
    'BRD-HOG-RUS-S',
    id,
    'Hogaza Rustic White Chico',
    'Rustic White sourdough loaf',
    45,
    'each',
    4
FROM categories
WHERE code = 'BRD';

INSERT INTO products (
    sku, category_id, name, description, price, unit, display_order
)
SELECT
    'BRD-HOG-MUL-L',
    id,
    'Hogaza Multigrain Grande',
    'Multigrain sourdough loaf',
    100,
    'each',
    5
FROM categories
WHERE code = 'BRD';

INSERT INTO products (
    sku, category_id, name, description, price, unit, display_order
)
SELECT
    'BRD-HOG-MUL-S',
    id,
    'Hogaza Multigrain Chico',
    'Multigrain sourdough loaf',
    50,
    'each',
    6
FROM categories
WHERE code = 'BRD';

INSERT INTO products (
    sku, category_id, name, description, price, unit, display_order
)
SELECT
    'BRD-HOG-WHW-L',
    id,
    'Hogaza Wholewheat Grande',
    'Wholewheat sourdough loaf',
    90,
    'each',
    7
FROM categories
WHERE code = 'BRD';

INSERT INTO products (
    sku, category_id, name, description, price, unit, display_order
)
SELECT
    'BRD-HOG-WHW-S',
    id,
    'Hogaza Wholewheat Chico',
    'Wholewheat sourdough loaf',
    45,
    'each',
    8
FROM categories
WHERE code = 'BRD';

INSERT INTO products (
    sku, category_id, name, description, price, unit, display_order
)
SELECT
    'BRD-HOG-RYE-L',
    id,
    'Hogaza Rye Grande',
    'Rye sourdough loaf',
    90,
    'each',
    9
FROM categories
WHERE code = 'BRD';

INSERT INTO products (
    sku, category_id, name, description, price, unit, display_order
)
SELECT
    'BRD-HOG-RYE-S',
    id,
    'Hogaza Rye Chico',
    'Rye sourdough loaf',
    45,
    'each',
    10
FROM categories
WHERE code = 'BRD';


-- ------------------------------------------
-- Pan de Caja
-- ------------------------------------------

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'BRD-BOX-CLA',
    id,
    'Pan de Caja Classic White',
    70,
    'each',
    11
FROM categories
WHERE code = 'BRD';

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'BRD-BOX-RUS',
    id,
    'Pan de Caja Rustic White',
    80,
    'each',
    12
FROM categories
WHERE code = 'BRD';

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'BRD-BOX-MUL',
    id,
    'Pan de Caja Multigrain',
    90,
    'each',
    13
FROM categories
WHERE code = 'BRD';

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'BRD-BOX-WHW',
    id,
    'Pan de Caja Wholewheat',
    80,
    'each',
    14
FROM categories
WHERE code = 'BRD';

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'BRD-BOX-RYE',
    id,
    'Pan de Caja Rye',
    80,
    'each',
    15
FROM categories
WHERE code = 'BRD';


-- ------------------------------------------
-- Baguette
-- ------------------------------------------

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'BRD-BAG-STD',
    id,
    'Baguette',
    35,
    'each',
    16
FROM categories
WHERE code = 'BRD';

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'BRD-BAG-LRG',
    id,
    'Baguette Large',
    50,
    'each',
    17
FROM categories
WHERE code = 'BRD';


-- ------------------------------------------
-- Bolita SD
-- ------------------------------------------

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'BRD-BOLITA-1',
    id,
    'Bolita SD',
    15,
    'each',
    18
FROM categories
WHERE code = 'BRD';

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'BRD-BOLITA-4',
    id,
    'Bolita SD Pack',
    50,
    'pack',
    19
FROM categories
WHERE code = 'BRD';


-- ------------------------------------------
-- Focaccia
-- ------------------------------------------

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'BRD-FOC-1',
    id,
    'Focaccia Slice',
    40,
    'slice',
    20
FROM categories
WHERE code = 'BRD';

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'BRD-FOC-4',
    id,
    'Focaccia Pack',
    150,
    'pack',
    21
FROM categories
WHERE code = 'BRD';


-- ------------------------------------------
-- Stix
-- ------------------------------------------

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'BRD-STX',
    id,
    'Stix',
    25,
    'each',
    22
FROM categories
WHERE code = 'BRD';

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'BRD-STX-PEP',
    id,
    'Pepperoni Stix',
    30,
    'each',
    23
FROM categories
WHERE code = 'BRD';


-- ------------------------------------------
-- Bollo
-- ------------------------------------------

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'BRD-BOLLO-1',
    id,
    'Bollo',
    20,
    'each',
    24
FROM categories
WHERE code = 'BRD';

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'BRD-BOLLO-4',
    id,
    'Bollo Pack',
    60,
    'pack',
    25
FROM categories
WHERE code = 'BRD';


-- ------------------------------------------
-- Brioche
-- ------------------------------------------

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'BRD-BRIO',
    id,
    'Brioche',
    60,
    'each',
    26
FROM categories
WHERE code = 'BRD';

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'BRD-BRIO-SP',
    id,
    'Specialty Brioche',
    100,
    'each',
    27
FROM categories
WHERE code = 'BRD';


-- ==========================================
-- Pretzels
-- ==========================================

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'PRE-SALT',
    id,
    'Salted Pretzel',
    50,
    'each',
    1
FROM categories
WHERE code = 'PRE';

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'PRE-CHEESE',
    id,
    'Cheese Pretzel',
    55,
    'each',
    2
FROM categories
WHERE code = 'PRE';

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'PRE-PEP',
    id,
    'Pepperoni Pretzel',
    60,
    'each',
    3
FROM categories
WHERE code = 'PRE';

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'PRE-PEP-JAL',
    id,
    'Pepperoni-Jalapeño Pretzel',
    65,
    'each',
    4
FROM categories
WHERE code = 'PRE';

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'PRE-CIN-SUG',
    id,
    'Cinnamon-Sugar Pretzel',
    50,
    'each',
    5
FROM categories
WHERE code = 'PRE';

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'PRE-BUN-1',
    id,
    'Pretzel Bun',
    25,
    'each',
    6
FROM categories
WHERE code = 'PRE';

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'PRE-BUN-4',
    id,
    'Pretzel Buns Pack',
    75,
    'pack',
    7
FROM categories
WHERE code = 'PRE';


-- ==========================================
-- Cookies
-- ==========================================

-- ------------------------------------------
-- Large Cookies
-- ------------------------------------------

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'COO-CHOC-NUT',
    id,
    'Chocolate Chunk w/ Nuts',
    50,
    'each',
    1
FROM categories
WHERE code = 'COO';

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'COO-OAT-CRAN',
    id,
    'Oatmeal with Cranberry/Dates',
    50,
    'each',
    2
FROM categories
WHERE code = 'COO';

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'COO-OAT-NUT',
    id,
    'Toasted Oatmeal with Nuts',
    50,
    'each',
    3
FROM categories
WHERE code = 'COO';

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'COO-LEM-BLUE',
    id,
    'Lemon/Blueberry',
    50,
    'each',
    4
FROM categories
WHERE code = 'COO';


-- ------------------------------------------
-- Small Cookies
-- ------------------------------------------

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'COO-SM-COFFEE',
    id,
    'Coffee/Cappuccino',
    10,
    'each',
    5
FROM categories
WHERE code = 'COO';

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'COO-SM-LEM',
    id,
    'Lemon/Butter',
    10,
    'each',
    6
FROM categories
WHERE code = 'COO';

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'COO-SM-CHOC',
    id,
    'Chocolate',
    10,
    'each',
    7
FROM categories
WHERE code = 'COO';

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'COO-SM-SUGAR',
    id,
    'Sugar Cookie',
    10,
    'each',
    8
FROM categories
WHERE code = 'COO';


-- ==========================================
-- Cakes & Pies
-- ==========================================


-- ------------------------------------------
-- Large Pies
-- ------------------------------------------

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'PIE-L-APPLE',
    id,
    'Apple Pie - Large',
    350,
    'each',
    1
FROM categories
WHERE code = 'PIE';

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'PIE-L-KEY',
    id,
    'Key Lime Pie - Large',
    350,
    'each',
    2
FROM categories
WHERE code = 'PIE';

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'PIE-L-COCO',
    id,
    'Coconut Cream Pie - Large',
    350,
    'each',
    3
FROM categories
WHERE code = 'PIE';

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'PIE-L-KAHLUA',
    id,
    'Kahlua Mousse Pie - Large',
    450,
    'each',
    4
FROM categories
WHERE code = 'PIE';

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'PIE-L-PECAN',
    id,
    'Pecan Pie - Large',
    500,
    'each',
    5
FROM categories
WHERE code = 'PIE';

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'PIE-L-PUMP',
    id,
    'Pumpkin Pie - Large',
    450,
    'each',
    6
FROM categories
WHERE code = 'PIE';

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'PIE-L-CHEESE',
    id,
    'Cheesecake - Large',
    800,
    'each',
    7
FROM categories
WHERE code = 'PIE';


-- ------------------------------------------
-- Small Pies
-- ------------------------------------------

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'PIE-S-APPLE',
    id,
    'Apple Pie - Small',
    75,
    'each',
    8
FROM categories
WHERE code = 'PIE';

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'PIE-S-KEY',
    id,
    'Key Lime Pie - Small',
    75,
    'each',
    9
FROM categories
WHERE code = 'PIE';

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'PIE-S-COCO',
    id,
    'Coconut Cream Pie - Small',
    75,
    'each',
    10
FROM categories
WHERE code = 'PIE';

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'PIE-S-KAHLUA',
    id,
    'Kahlua Mousse Pie - Small',
    90,
    'each',
    11
FROM categories
WHERE code = 'PIE';

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'PIE-S-PECAN',
    id,
    'Pecan Pie - Small',
    100,
    'each',
    12
FROM categories
WHERE code = 'PIE';

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'PIE-S-PUMP',
    id,
    'Pumpkin Pie - Small',
    100,
    'each',
    13
FROM categories
WHERE code = 'PIE';

INSERT INTO products (
    sku, category_id, name, price, unit, display_order
)
SELECT
    'PIE-S-CHEESE',
    id,
    'Cheesecake - Small',
    120,
    'each',
    14
FROM categories
WHERE code = 'PIE';


-- ==========================================
-- Product Availability
-- Normal weekly availability
-- ==========================================


-- ------------------------------------------
-- Hogazas
-- Wednesday & Friday
-- ------------------------------------------

INSERT INTO product_availability (product_id, day_of_week)
SELECT id, 3
FROM products
WHERE sku LIKE 'BRD-HOG-%';

INSERT INTO product_availability (product_id, day_of_week)
SELECT id, 5
FROM products
WHERE sku LIKE 'BRD-HOG-%';


-- ------------------------------------------
-- Pan de Caja
-- Wednesday & Friday
-- ------------------------------------------

INSERT INTO product_availability (product_id, day_of_week)
SELECT id, 3
FROM products
WHERE sku LIKE 'BRD-BOX-%';

INSERT INTO product_availability (product_id, day_of_week)
SELECT id, 5
FROM products
WHERE sku LIKE 'BRD-BOX-%';


-- ------------------------------------------
-- Baguette
-- Wednesday through Saturday
-- ------------------------------------------

INSERT INTO product_availability (product_id, day_of_week)
SELECT id, 3
FROM products
WHERE sku LIKE 'BRD-BAG-%';

INSERT INTO product_availability (product_id, day_of_week)
SELECT id, 4
FROM products
WHERE sku LIKE 'BRD-BAG-%';

INSERT INTO product_availability (product_id, day_of_week)
SELECT id, 5
FROM products
WHERE sku LIKE 'BRD-BAG-%';

INSERT INTO product_availability (product_id, day_of_week)
SELECT id, 6
FROM products
WHERE sku LIKE 'BRD-BAG-%';


-- ------------------------------------------
-- Bolita SD
-- Wednesday through Saturday
-- ------------------------------------------

INSERT INTO product_availability (product_id, day_of_week)
SELECT id, 3
FROM products
WHERE sku LIKE 'BRD-BOLITA-%';

INSERT INTO product_availability (product_id, day_of_week)
SELECT id, 4
FROM products
WHERE sku LIKE 'BRD-BOLITA-%';

INSERT INTO product_availability (product_id, day_of_week)
SELECT id, 5
FROM products
WHERE sku LIKE 'BRD-BOLITA-%';

INSERT INTO product_availability (product_id, day_of_week)
SELECT id, 6
FROM products
WHERE sku LIKE 'BRD-BOLITA-%';


-- ------------------------------------------
-- Focaccia
-- Wednesday & Friday
-- ------------------------------------------

INSERT INTO product_availability (product_id, day_of_week)
SELECT id, 3
FROM products
WHERE sku LIKE 'BRD-FOC-%';

INSERT INTO product_availability (product_id, day_of_week)
SELECT id, 5
FROM products
WHERE sku LIKE 'BRD-FOC-%';


-- ------------------------------------------
-- Stix
-- Wednesday & Friday
-- ------------------------------------------

INSERT INTO product_availability (product_id, day_of_week)
SELECT id, 3
FROM products
WHERE sku LIKE 'BRD-STX%';

INSERT INTO product_availability (product_id, day_of_week)
SELECT id, 5
FROM products
WHERE sku LIKE 'BRD-STX%';


-- ------------------------------------------
-- Bollo
-- Wednesday only
-- ------------------------------------------

INSERT INTO product_availability (product_id, day_of_week)
SELECT id, 3
FROM products
WHERE sku LIKE 'BRD-BOLLO-%';


-- ------------------------------------------
-- Brioche
-- Wednesday & Friday
-- ------------------------------------------

INSERT INTO product_availability (product_id, day_of_week)
SELECT id, 3
FROM products
WHERE sku LIKE 'BRD-BRIO%';

INSERT INTO product_availability (product_id, day_of_week)
SELECT id, 5
FROM products
WHERE sku LIKE 'BRD-BRIO%';