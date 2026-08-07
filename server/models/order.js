const db = require("../config/database");

function isValidMoney(amount) {
    return (
        Number.isFinite(amount) &&
        amount > 0 &&
        Math.round(amount * 100) === amount * 100
    );
}

function createOrder({
    order_number,
    customer_id,
    pickup_date = null,
    pickup_time = null,
    delivery = 0,
    delivery_address = null,
    notes = null,
    created_by = null
}) {
    const result = db.prepare(`
        INSERT INTO orders (
            order_number,
            customer_id,
            pickup_date,
            pickup_time,
            delivery,
            delivery_address,
            notes,
            created_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        order_number,
        customer_id,
        pickup_date,
        pickup_time,
        delivery,
        delivery_address,
        notes,
        created_by
    );

    return getOrderById(result.lastInsertRowid);
}

function addOrderItem({
    order_id,
    product_id = null,
    custom_name = null,
    unit_price = null,
    quantity,
    notes = null
}) {
    const order = db.prepare(`
        SELECT id
        FROM orders
        WHERE id = ?
    `).get(order_id);

    if (!order) {
        throw new Error(`Order ${order_id} not found.`);
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new Error(
            "Quantity must be greater than zero."
        );
    }

    let finalPrice = unit_price;
    let finalProductId = product_id;
    let finalCustomName = custom_name;

    // Catalog item
    if (product_id !== null) {

        const product = db.prepare(`
            SELECT
                id,
                name,
                price
            FROM products
            WHERE id = ?
              AND active = 1
        `).get(product_id);

        if (!product) {
            throw new Error(
                `Product ${product_id} not found or inactive.`
            );
        }

        finalPrice = product.price;
        finalCustomName = null;
    }

    // Custom item
    else {

        if (!custom_name) {
            throw new Error(
                "Custom item name is required."
            );
        }

        if (
            !Number.isFinite(unit_price) ||
            unit_price < 0
        ) {
            throw new Error(
                "Custom item price is required."
            );
        }

        finalProductId = null;
    }


    const transaction = db.transaction(() => {

        db.prepare(`
            INSERT INTO order_items (
                order_id,
                product_id,
                custom_name,
                quantity,
                unit_price,
                notes
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            order_id,
            finalProductId,
            finalCustomName,
            quantity,
            finalPrice,
            notes
        );

        updateOrderTotal(order_id);
    });

    transaction();

    return getOrderById(order_id);
}

function removeOrderItem(orderId, orderItemId) {
    const item = db.prepare(`
        SELECT
            id,
            order_id,
            quantity
        FROM order_items
        WHERE id = ?
    `).get(orderItemId);

    if (!item) {
        throw new Error(`Order item ${orderItemId} not found.`);
    }

    if (item.order_id !== orderId) {
        throw new Error(
            `Order item ${orderItemId} does not belong to order ${orderId}.`
        );
    }

    const pickedUpResult = db.prepare(`
        SELECT COALESCE(
            SUM(quantity),
            0
        ) AS quantity_picked_up
        FROM order_item_pickups
        WHERE order_item_id = ?
    `).get(orderItemId);

    const quantityPickedUp = pickedUpResult.quantity_picked_up;

    if (quantityPickedUp > 0) {
        throw new Error(
            `Cannot remove order item ${orderItemId} because ${quantityPickedUp} has already been picked up.`
        );
    }

    const transaction = db.transaction(() => {
        db.prepare(`
            DELETE FROM order_items
            WHERE id = ?
        `).run(orderItemId);

        updateOrderTotal(item.order_id);
    });

    transaction();

    return getOrderById(item.order_id);
}

function recordItemPickup(
    orderId,
    orderItemId,
    quantity,
    pickedUpBy = null,
    notes = null
) {
    const order = db.prepare(`
        SELECT id
        FROM orders
        WHERE id = ?
    `).get(orderId);

    if (!order) {
        throw new Error(`Order ${orderId} not found.`);
    }

    const item = db.prepare(`
        SELECT
            id,
            order_id,
            quantity
        FROM order_items
        WHERE id = ?
    `).get(orderItemId);

    if (!item) {
        throw new Error(`Order item ${orderItemId} not found.`);
    }

    if (item.order_id !== orderId) {
        throw new Error(
            `Order item ${orderItemId} does not belong to order ${orderId}.`
        );
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new Error(
            "Pickup quantity must be greater than zero."
        );
    }

    const pickedUpResult = db.prepare(`
        SELECT COALESCE(
            SUM(quantity),
            0
        ) AS quantity_picked_up
        FROM order_item_pickups
        WHERE order_item_id = ?
    `).get(orderItemId);

    const quantityPickedUp = pickedUpResult.quantity_picked_up;
    const remainingQuantity = item.quantity - quantityPickedUp;

    if (quantity > remainingQuantity) {
        throw new Error(
            `Pickup quantity exceeds remaining quantity of ${remainingQuantity}.`
        );
    }

    const transaction = db.transaction(() => {
    db.prepare(`
        INSERT INTO order_item_pickups (
            order_item_id,
            quantity,
            picked_up_by,
            notes
        )
        VALUES (?, ?, ?, ?)
    `).run(
        orderItemId,
        quantity,
        pickedUpBy,
        notes
    );

    const pickupTotals = db.prepare(`
        SELECT
            oi.quantity,
            COALESCE(
                SUM(oip.quantity),
                0
            ) AS quantity_picked_up
        FROM order_items oi

        LEFT JOIN order_item_pickups oip
            ON oi.id = oip.order_item_id

        WHERE oi.id = ?

        GROUP BY oi.id
    `).get(orderItemId);

    if (
        pickupTotals.quantity_picked_up >= pickupTotals.quantity
    ) {
        db.prepare(`
            UPDATE order_items
            SET production_status = 'COMPLETED'
            WHERE id = ?
        `).run(orderItemId);
    }
});

transaction();

    return getOrderById(orderId);
}

function getPickupHistory(orderId) {
    const order = db.prepare(`
        SELECT id
        FROM orders
        WHERE id = ?
    `).get(orderId);

    if (!order) {
        throw new Error(`Order ${orderId} not found.`);
    }

    return db.prepare(`
        SELECT
            oip.id,
            oip.order_item_id,
            p.name AS product_name,
            p.sku,
            oip.quantity,
            oip.picked_up_by,
            u.name AS picked_up_by_name,
            oip.picked_up_at,
            oip.notes
        FROM order_item_pickups oip

        JOIN order_items oi
            ON oip.order_item_id = oi.id

        JOIN products p
            ON oi.product_id = p.id

        LEFT JOIN users u
            ON oip.picked_up_by = u.id

        WHERE oi.order_id = ?

        ORDER BY
            oip.picked_up_at,
            oip.id
    `).all(orderId);
}

function updateOrderItem(orderId, orderItemId, { quantity, notes = null }) {
    const item = db.prepare(`
        SELECT
            id,
            order_id,
            quantity
        FROM order_items
        WHERE id = ?
    `).get(orderItemId);

    if (!item) {
        throw new Error(`Order item ${orderItemId} not found.`);
    }

    if (item.order_id !== orderId) {
        throw new Error(
            `Order item ${orderItemId} does not belong to order ${orderId}.`
        );
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new Error("Quantity must be greater than zero.");
    }

    const pickedUpResult = db.prepare(`
        SELECT COALESCE(
            SUM(quantity),
            0
        ) AS quantity_picked_up
        FROM order_item_pickups
        WHERE order_item_id = ?
    `).get(orderItemId);

    const quantityPickedUp = pickedUpResult.quantity_picked_up;

    if (quantity < quantityPickedUp) {
        throw new Error(
            `Quantity cannot be less than the ${quantityPickedUp} already picked up.`
        );
    }

    const transaction = db.transaction(() => {
        db.prepare(`
            UPDATE order_items
            SET
                quantity = ?,
                notes = ?
            WHERE id = ?
        `).run(
            quantity,
            notes,
            orderItemId
        );

        updateOrderTotal(orderId);
    });

    transaction();

    return getOrderById(orderId);
}

function updateOrderItemProductionStatus(
    orderId,
    orderItemId,
    productionStatus
) {
    const validStatuses = [
        "PENDING",
        "IN_PROGRESS",
        "READY",
        "COMPLETED"
    ];

    if (!validStatuses.includes(productionStatus)) {
        throw new Error(
            `Invalid production status: ${productionStatus}`
        );
    }

    const item = db.prepare(`
        SELECT
            id,
            order_id
        FROM order_items
        WHERE id = ?
    `).get(orderItemId);


    if (!item) {
        throw new Error(
            `Order item ${orderItemId} not found.`
        );
    }


    if (item.order_id !== orderId) {
        throw new Error(
            `Order item ${orderItemId} does not belong to order ${orderId}.`
        );
    }


    db.prepare(`
        UPDATE order_items
        SET
            production_status = ?
        WHERE id = ?
    `).run(
        productionStatus,
        orderItemId
    );


    return getOrderById(orderId);
}

function updateOrderTotal(orderId) {
    const order = db.prepare(`
        SELECT
            id,
            amount_paid
        FROM orders
        WHERE id = ?
    `).get(orderId);

    if (!order) {
        throw new Error(`Order ${orderId} not found.`);
    }

    const result = db.prepare(`
        SELECT COALESCE(
            SUM(quantity * unit_price),
            0
        ) AS total_amount
        FROM order_items
        WHERE order_id = ?
    `).get(orderId);

    const newTotal = result.total_amount;

    if (order.amount_paid > newTotal) {
        throw new Error(
            `Order total cannot be less than amount already paid (${order.amount_paid}).`
        );
    }

    let paymentStatus = "UNPAID";

    if (order.amount_paid > 0 && order.amount_paid < newTotal) {
        paymentStatus = "PARTIAL";
    }

    if (order.amount_paid === newTotal && newTotal > 0) {
        paymentStatus = "PAID";
    }

    db.prepare(`
        UPDATE orders
        SET
            total_amount = ?,
            payment_status = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `).run(
        newTotal,
        paymentStatus,
        orderId
    );

    return newTotal;
}

function getOrderById(id) {
    const order = db.prepare(`
        SELECT
            o.id,
            o.order_number,
            o.status,
            o.payment_status,
            o.total_amount,
            o.amount_paid,
            o.pickup_date,
            o.pickup_time,
            o.delivery,
            o.delivery_address,
            o.notes,
            o.created_by,
            o.created_at,
            o.updated_at,

            c.id AS customer_id,
            c.name AS customer_name,
            c.phone AS customer_phone,
            c.preferred_language AS customer_language

        FROM orders o

        JOIN customers c
            ON o.customer_id = c.id

        WHERE o.id = ?
    `).get(id);

    if (!order) {
        return undefined;
    }

        order.items = db.prepare(`
        SELECT
            oi.id,
            oi.product_id,
            p.sku,

            COALESCE(
                p.name,
                oi.custom_name
            ) AS product_name,

            oi.quantity,

            oi.production_status,

            COALESCE(
                (
                    SELECT SUM(oip.quantity)
                    FROM order_item_pickups oip
                    WHERE oip.order_item_id = oi.id
                ),
                0
            ) AS quantity_picked_up,

            oi.quantity -
            COALESCE(
                (
                    SELECT SUM(oip.quantity)
                    FROM order_item_pickups oip
                    WHERE oip.order_item_id = oi.id
                ),
                0
            ) AS quantity_remaining,

            oi.unit_price,
            oi.notes,

            (oi.quantity * oi.unit_price) AS line_total

        FROM order_items oi

        LEFT JOIN products p
            ON oi.product_id = p.id

        WHERE oi.order_id = ?

        ORDER BY oi.id
    `).all(id);

    return order;
}

function getOrderByNumber(orderNumber) {
    const order = db.prepare(`
        SELECT id
        FROM orders
        WHERE order_number = ?
    `).get(orderNumber);

    if (!order) {
        return undefined;
    }

    return getOrderById(order.id);
}

function getAllOrders() {
    const orders = db.prepare(`
        SELECT
            o.id,
            o.order_number,
            o.status,
            o.payment_status,
            o.total_amount,
            o.amount_paid,
            o.pickup_date,
            o.pickup_time,
            o.delivery,

            c.id AS customer_id,
            c.name AS customer_name,
            c.phone AS customer_phone

        FROM orders o

        JOIN customers c
            ON o.customer_id = c.id

        ORDER BY
            o.pickup_date,
            o.pickup_time,
            o.created_at
    `).all();

    return orders;
}

function updateOrderStatus(id, status) {
    db.prepare(`
        UPDATE orders
        SET
            status = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `).run(status, id);

    return getOrderById(id);
}

function recordPayment({
    orderId,
    amount,
    paymentMethod,
    reference = null,
    recordedBy = null,
    notes = null
}) {
    const transaction = db.transaction(() => {
        const order = db.prepare(`
            SELECT
                id,
                total_amount,
                amount_paid
            FROM orders
            WHERE id = ?
        `).get(orderId);

        if (!order) {
            throw new Error(`Order ${orderId} not found.`);
        }

        if (!Number.isFinite(amount) || amount <= 0) {
            throw new Error(
                "Payment amount must be greater than zero."
            );
        }

        const validMethods = [
            "CASH",
            "BANK_TRANSFER"
        ];

        if (!validMethods.includes(paymentMethod)) {
            throw new Error(
                `Invalid payment method: ${paymentMethod}`
            );
        }

        const newAmountPaid = order.amount_paid + amount;

        if (newAmountPaid > order.total_amount) {
            throw new Error(
                `Payment exceeds remaining balance of ${order.total_amount - order.amount_paid}.`
            );
        }

        let paymentStatus = "PARTIAL";

        if (newAmountPaid === order.total_amount) {
            paymentStatus = "PAID";
        }

        db.prepare(`
            INSERT INTO payments (
                order_id,
                amount,
                payment_method,
                reference,
                recorded_by,
                notes
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            orderId,
            amount,
            paymentMethod,
            reference,
            recordedBy,
            notes
        );

        db.prepare(`
            UPDATE orders
            SET
                amount_paid = ?,
                payment_status = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            newAmountPaid,
            paymentStatus,
            orderId
        );
    });

    transaction();

    return getOrderById(orderId);
}

function getPaymentHistory(orderId) {
    const order = db.prepare(`
        SELECT id
        FROM orders
        WHERE id = ?
    `).get(orderId);

    if (!order) {
        throw new Error(`Order ${orderId} not found.`);
    }

    return db.prepare(`
        SELECT
            p.id,
            p.order_id,
            p.amount,
            p.payment_method,
            p.reference,
            p.recorded_by,
            u.name AS recorded_by_name,
            p.notes,
            p.created_at
        FROM payments p

        LEFT JOIN users u
            ON p.recorded_by = u.id

        WHERE p.order_id = ?

        ORDER BY p.created_at, p.id
    `).all(orderId);
}

module.exports = {
    createOrder,
    addOrderItem,
    removeOrderItem,
    recordItemPickup,
    getPickupHistory,
    updateOrderItem,
    updateOrderItemProductionStatus,
    updateOrderTotal,
    getOrderById,
    getOrderByNumber,
    getAllOrders,
    updateOrderStatus,
    recordPayment,
    getPaymentHistory
};