const db = require("../config/database");

function getAllCustomers() {
    return db.prepare(`
        SELECT
            c.id,
            c.name,
            c.phone,
            c.preferred_language,
            c.address,
            c.notes,
            c.active,
            cm.id AS contact_method_id,
            cm.name AS contact_method,
            cm.code AS contact_method_code
        FROM customers c
        LEFT JOIN contact_methods cm
            ON c.contact_method_id = cm.id
        WHERE c.active = 1
        ORDER BY c.name
    `).all();
}

function getCustomerById(id) {
    return db.prepare(`
        SELECT
            c.id,
            c.name,
            c.phone,
            c.preferred_language,
            c.address,
            c.notes,
            c.active,
            cm.id AS contact_method_id,
            cm.name AS contact_method,
            cm.code AS contact_method_code
        FROM customers c
        LEFT JOIN contact_methods cm
            ON c.contact_method_id = cm.id
        WHERE c.id = ?
    `).get(id);
}

function getCustomerByPhone(phone) {
    return db.prepare(`
        SELECT
            c.id,
            c.name,
            c.phone,
            c.preferred_language,
            c.address,
            c.notes,
            c.active,
            cm.id AS contact_method_id,
            cm.name AS contact_method,
            cm.code AS contact_method_code
        FROM customers c
        LEFT JOIN contact_methods cm
            ON c.contact_method_id = cm.id
        WHERE c.phone = ?
          AND c.active = 1
    `).get(phone);
}

function createCustomer({
    name,
    phone = null,
    contact_method_id = null,
    preferred_language = "BILINGUAL",
    address = null,
    notes = null
}) {
    const result = db.prepare(`
        INSERT INTO customers (
            name,
            phone,
            contact_method_id,
            preferred_language,
            address,
            notes
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `).run(
        name,
        phone,
        contact_method_id,
        preferred_language,
        address,
        notes
    );

    return getCustomerById(result.lastInsertRowid);
}

function updateCustomer(id, {
    name,
    phone = null,
    contact_method_id = null,
    preferred_language = "BILINGUAL",
    address = null,
    notes = null
}) {
    db.prepare(`
        UPDATE customers
        SET
            name = ?,
            phone = ?,
            contact_method_id = ?,
            preferred_language = ?,
            address = ?,
            notes = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `).run(
        name,
        phone,
        contact_method_id,
        preferred_language,
        address,
        notes,
        id
    );

    return getCustomerById(id);
}

module.exports = {
    getAllCustomers,
    getCustomerById,
    getCustomerByPhone,
    createCustomer,
    updateCustomer
};