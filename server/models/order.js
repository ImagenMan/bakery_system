const db = require("../config/database");
const user = require("./user");
const { isValidMoney, roundMoney } = require("../utils/money");

function getMutableOrder(orderId) {
    const order = db.prepare(`
        SELECT
            id,
            order_type,
            status
        FROM orders
        WHERE id = ?
    `).get(orderId);

    if (!order) {
        throw new Error(`Order ${orderId} not found.`);
    }

    if (
        order.order_type === "COUNTER_SALE" &&
        order.status === "COMPLETED"
    ) {
        throw new Error(
            `Completed counter sale ${orderId} cannot be modified.`
        );
    }

    return order;
}

function createOrder({
    order_number,
    customer_id,
    order_type = "PREORDER",
    pickup_date = null,
    pickup_time = null,
    delivery = 0,
    delivery_address = null,
    notes = null,
    created_by = null
}) {
    const transaction = db.transaction(() => {
        let finalOrderNumber = order_number;

        if (order_type === "COUNTER_SALE") {
            const now = new Date();

            const yy = String(now.getFullYear()).slice(-2);
            const mm = String(now.getMonth() + 1).padStart(2, "0");
            const dd = String(now.getDate()).padStart(2, "0");

            const datePart = `${yy}${mm}${dd}`;
            const prefix = `CS-${datePart}-`;

            const lastOrder = db.prepare(`
                SELECT order_number
                FROM orders
                WHERE order_type = 'COUNTER_SALE'
                  AND order_number LIKE ?
                ORDER BY order_number DESC
                LIMIT 1
            `).get(`${prefix}%`);

            let sequence = 1;

            if (lastOrder) {
                const lastSequence = Number(
                    lastOrder.order_number.slice(prefix.length)
                );

                if (Number.isInteger(lastSequence)) {
                    sequence = lastSequence + 1;
                }
            }

            finalOrderNumber =
                `${prefix}${String(sequence).padStart(3, "0")}`;
        }

        const result = db.prepare(`
            INSERT INTO orders (
                order_number,
                customer_id,
                order_type,
                pickup_date,
                pickup_time,
                delivery,
                delivery_address,
                notes,
                created_by
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            finalOrderNumber,
            customer_id,
            order_type,
            pickup_date,
            pickup_time,
            delivery,
            delivery_address,
            notes,
            created_by
        );

        return result.lastInsertRowid;
    });

    const orderId = transaction();

    return getOrderById(orderId);
}

function createCounterSale({
    customer_id = null,
    items,
    payment_method,
    cash_received = null,
    reference = null,
    notes = null,
    created_by
}) {
    if (!Array.isArray(items) || items.length === 0) {
        throw new Error(
            "A counter sale must contain at least one item."
        );
    }

    const validMethods = [
        "CASH",
        "CARD",
        "BANK_TRANSFER",
        "OTHER"
    ];

    if (!validMethods.includes(payment_method)) {
        throw new Error(
            `Invalid payment method: ${payment_method}`
        );
    }

    const transaction = db.transaction(() => {

        const now = new Date();

        const yy = String(now.getFullYear()).slice(-2);
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");

        const datePart = `${yy}${mm}${dd}`;
        const prefix = `CS-${datePart}-`;

        const lastOrder = db.prepare(`
            SELECT order_number
            FROM orders
            WHERE order_type = 'COUNTER_SALE'
              AND order_number LIKE ?
            ORDER BY order_number DESC
            LIMIT 1
        `).get(`${prefix}%`);

        let sequence = 1;

        if (lastOrder) {
            const lastSequence = Number(
                lastOrder.order_number.slice(prefix.length)
            );

            if (Number.isInteger(lastSequence)) {
                sequence = lastSequence + 1;
            }
        }

        const orderNumber =
            `${prefix}${String(sequence).padStart(3, "0")}`;

        const orderResult = db.prepare(`
            INSERT INTO orders (
                order_number,
                customer_id,
                order_type,
                status,
                payment_status,
                total_amount,
                amount_paid,
                notes,
                created_by
            )
            VALUES (?, ?, 'COUNTER_SALE', 'NEW', 'UNPAID', 0, 0, ?, ?)
        `).run(
            orderNumber,
            customer_id,
            notes,
            created_by
        );

        const orderId = orderResult.lastInsertRowid;

        for (const item of items) {
            insertOrderItem({
                order_id: orderId,
                product_id: item.product_id ?? null,
                custom_product_id: item.custom_product_id ?? null,
                custom_name: item.custom_name ?? null,
                unit_price: item.unit_price ?? null,
                quantity: item.quantity,
                notes: item.notes ?? null,
                user_id: created_by
            });
        }

        const order = db.prepare(`
            SELECT
                id,
                order_type,
                total_amount,
                amount_paid
            FROM orders
            WHERE id = ?
        `).get(orderId);

        if (!order) {
            throw new Error(`Order ${orderId} not found.`);
        }

        if (order.total_amount <= 0) {
            throw new Error(
                "Counter sale total must be greater than zero."
            );
        }

        if (payment_method === "CASH") {
            if (
                !Number.isFinite(cash_received) ||
                cash_received < order.total_amount
            ) {
                throw new Error(
                    "Cash received must be greater than or equal to the sale total."
                );
            }
        }

        const paymentAmount = roundMoney(order.total_amount);

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
            paymentAmount,
            payment_method,
            reference,
            created_by,
            notes
        );

        db.prepare(`
            UPDATE orders
            SET
                amount_paid = ?,
                payment_status = 'PAID',
                status = 'COMPLETED',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            paymentAmount,
            orderId
        );

        return {
            orderId,
            change:
                payment_method === "CASH"
                    ? roundMoney(cash_received - paymentAmount)
                    : 0
        };
    });

    const result = transaction();

    return {
        order: getOrderById(result.orderId),
        change: result.change
    };
}

function insertOrderItem({
    order_id,
    product_id = null,
    custom_product_id = null,
    custom_name = null,
    unit_price = null,
    quantity,
    notes = null,
    user_id
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

    if (
        product_id !== null &&
        custom_product_id !== null
    ) {
        throw new Error(
            "An order item cannot reference both a catalog product and a custom product."
        );
    }

    if (
        custom_product_id !== null &&
        custom_name !== null
    ) {
        throw new Error(
            "An approved custom product cannot also use a custom item name."
        );
    }

    let finalPrice = unit_price;
    let finalProductId = product_id;
    let finalCustomProductId = custom_product_id;
    let finalCustomName = custom_name;

    // Approved custom product
    if (custom_product_id !== null) {

        if (unit_price !== null) {
            throw new Error(
                "Price cannot be supplied when using an approved custom product."
            );
        }

        const customProduct = db.prepare(`
            SELECT
                id,
                name,
                price
            FROM custom_products
            WHERE id = ?
              AND active = 1
        `).get(custom_product_id);

        if (!customProduct) {
            throw new Error(
                `Custom product ${custom_product_id} not found or inactive.`
            );
        }

        finalPrice = customProduct.price;
        finalProductId = null;
        finalCustomName = null;
    }

    // Catalog item
    else if (product_id !== null) {

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

        // Normal catalog price
        if (unit_price === null) {
            finalPrice = product.price;
        }

        // Special/custom catalog price
        else {
            if (!isValidMoney(unit_price)) {
                throw new Error(
                    "Custom price must be greater than zero and use no more than two decimal places."
                );
            }

            user.requireAdmin(user_id);
            finalPrice = unit_price;
        }

        finalCustomProductId = null;
        finalCustomName = null;
    }

    // Free-form custom item
    else {

        if (!custom_name) {
            throw new Error(
                "Custom item name is required."
            );
        }

        if (!isValidMoney(unit_price)) {
            throw new Error(
                "Custom item price must be greater than zero and use no more than two decimal places."
            );
        }

        user.requireAdmin(user_id);
        finalProductId = null;
        finalCustomProductId = null;
    }

    db.prepare(`
        INSERT INTO order_items (
            order_id,
            product_id,
            custom_product_id,
            custom_name,
            quantity,
            unit_price,
            notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
        order_id,
        finalProductId,
        finalCustomProductId,
        finalCustomName,
        quantity,
        finalPrice,
        notes
    );

    updateOrderTotal(order_id);
}

function addOrderItem({
    order_id,
    product_id = null,
    custom_product_id = null,
    custom_name = null,
    unit_price = null,
    quantity,
    notes = null,
    user_id
}) {
    getMutableOrder(order_id);

    const transaction = db.transaction(() => {
        insertOrderItem({
            order_id,
            product_id,
            custom_product_id,
            custom_name,
            unit_price,
            quantity,
            notes,
            user_id
        });
    });

    transaction();

    return getOrderById(order_id);
}

function removeOrderItem(orderId, orderItemId) {

    getMutableOrder(orderId);

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
            COALESCE(p.name, oi.custom_name) AS product_name,
            p.sku,
            oip.quantity,
            oip.picked_up_by,
            u.name AS picked_up_by_name,
            oip.picked_up_at,
            oip.notes
        FROM order_item_pickups oip

        JOIN order_items oi
            ON oip.order_item_id = oi.id

        LEFT JOIN products p
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

    getMutableOrder(orderId);

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

    const newTotal = roundMoney(result.total_amount);

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
            o.order_type,
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

        LEFT JOIN customers c
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
            oi.custom_product_id,
            p.sku,

            COALESCE(
                p.name,
                cp.name,
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

            ROUND(oi.quantity * oi.unit_price, 2) AS line_total

        FROM order_items oi

        LEFT JOIN products p
            ON oi.product_id = p.id

        LEFT JOIN custom_products cp
            ON oi.custom_product_id = cp.id

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
            o.order_type,
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

        LEFT JOIN customers c
            ON o.customer_id = c.id

        ORDER BY
            o.pickup_date,
            o.pickup_time,
            o.created_at
    `).all();

    return orders;
}

function updateOrderStatus(id, status) {
    const validStatuses = [
        "NEW",
        "CONFIRMED",
        "READY",
        "COMPLETED",
        "CANCELLED"
    ];

    if (!validStatuses.includes(status)) {
        throw new Error(
            `Invalid order status: ${status}`
        );
    }

    const order = db.prepare(`
        SELECT
            id,
            order_type,
            status
        FROM orders
        WHERE id = ?
    `).get(id);

    if (!order) {
        throw new Error(`Order ${id} not found.`);
    }

    if (
        order.order_type === "COUNTER_SALE" &&
        order.status === "COMPLETED"
    ) {
        throw new Error(
            `Completed counter sale ${id} cannot be modified.`
        );
    }

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
    cashReceived = null,
    reference = null,
    recordedBy = null,
    notes = null
}) {
    getMutableOrder(orderId);

    const transaction = db.transaction(() => {
        const order = db.prepare(`
            SELECT
                id,
                order_type,
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
            "CARD",
            "BANK_TRANSFER",
            "OTHER"
        ];

        if (!validMethods.includes(paymentMethod)) {
            throw new Error(
                `Invalid payment method: ${paymentMethod}`
            );
        }

        const newAmountPaid = roundMoney(order.amount_paid + amount);

        let change = 0;

        if (paymentMethod === "CASH") {

            if (
                !Number.isFinite(cashReceived) ||
                cashReceived < amount
            ) {
                throw new Error(
                    "Cash received must be greater than or equal to the payment amount."
                );
            }

            change = roundMoney(cashReceived - amount);
        }

        if (newAmountPaid > order.total_amount) {
            throw new Error(
                `Payment exceeds remaining balance of ${order.total_amount - order.amount_paid}.`
            );
        }

        let paymentStatus = "PARTIAL";

        if (newAmountPaid === order.total_amount) {
            paymentStatus = "PAID";
        }

        let orderStatus = null;

        if (
            order.order_type === "COUNTER_SALE" &&
            paymentStatus === "PAID"
        ) {
            orderStatus = "COMPLETED";
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
                status = COALESCE(?, status),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            newAmountPaid,
            paymentStatus,
            orderStatus,
            orderId
        );
    });

    transaction();

    let change = 0;

    if (paymentMethod === "CASH") {
        change = roundMoney(cashReceived - amount);
    }

    return {
        order: getOrderById(orderId),
        change
    };
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
    createCounterSale,
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