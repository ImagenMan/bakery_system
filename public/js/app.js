// =========================================================
// Bakery System
// Orders UI
// =========================================================

// --- DOM Elements ---

const ordersView = document.getElementById("orders-view");
const orderDetailView = document.getElementById("order-detail-view");
const newOrderView = document.getElementById("new-order-view");

const ordersList = document.getElementById("orders-list");
const orderDetail = document.getElementById("order-detail");
const newOrderForm = document.getElementById("new-order-form");



// =========================================================
// Utility Functions
// =========================================================

function escapeHTML(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function formatMoney(value) {
    const amount = Number(value);

    if (!Number.isFinite(amount)) {
        return "$0.00";
    }

    return `$${amount.toFixed(2)}`;
}


// =========================================================
// Orders List
// =========================================================

async function loadOrders() {
    ordersList.innerHTML = `
        <p class="loading">Loading orders...</p>
    `;

    try {
        const response = await fetch("/api/orders");

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}.`);
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(
                result.error || "Failed to load orders."
            );
        }

        renderOrders(result.data);

    } catch (error) {
        console.error("loadOrders error:", error);

        ordersList.innerHTML = `
            <p class="error">
                ${escapeHTML(error.message)}
            </p>
        `;
    }
}


function renderOrders(orders) {
    if (!Array.isArray(orders) || orders.length === 0) {
        ordersList.innerHTML = `
            <p>No orders found.</p>
        `;
        return;
    }

    ordersList.innerHTML = orders.map(order => `
        <button
            type="button"
            class="order-card"
            data-order-id="${Number(order.id)}"
        >
            <div>
                <strong>
                    ${escapeHTML(order.order_number)}
                </strong>

                <span>
                    ${escapeHTML(order.customer_name)}
                </span>
            </div>

            <div>
                <span>
                    ${escapeHTML(order.pickup_date)}
                </span>

                <span>
                    ${escapeHTML(order.pickup_time || "")}
                </span>
            </div>

            <div class="order-card-statuses">
                <span class="status-badge status-${escapeHTML(
                    String(order.status || "").toLowerCase()
                )}">
                    ${escapeHTML(order.status)}
                </span>

                <span class="status-badge payment-${escapeHTML(
                    String(order.payment_status || "").toLowerCase()
                )}">
                    ${escapeHTML(order.payment_status)}
                </span>
            </div>

            <strong class="order-total">
                ${formatMoney(order.total_amount)}
            </strong>
        </button>
    `).join("");

    document
        .querySelectorAll(".order-card")
        .forEach(card => {
            card.addEventListener("click", () => {
                const orderId = Number(card.dataset.orderId);

                if (!Number.isInteger(orderId) || orderId <= 0) {
                    return;
                }

                loadOrderDetail(orderId);
            });
        });
}


// =========================================================
// Order Detail
// =========================================================

async function loadOrderDetail(orderId) {
    if (!Number.isInteger(Number(orderId)) || Number(orderId) <= 0) {
        return;
    }

    ordersView.classList.add("hidden");
    orderDetailView.classList.remove("hidden");

    orderDetail.innerHTML = `
        <p class="loading">Loading order...</p>
    `;

    try {
        const response = await fetch(
            `/api/orders/${Number(orderId)}`
        );

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}.`);
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(
                result.error || "Failed to load order."
            );
        }

        renderOrderDetail(result.data);

    } catch (error) {
        console.error("loadOrderDetail error:", error);

        orderDetail.innerHTML = `
            <p class="error">
                ${escapeHTML(error.message)}
            </p>
        `;
    }
}


function renderOrderDetail(order) {
    const total = Number(order.total_amount) || 0;
    const paid = Number(order.amount_paid) || 0;
    const balance = Math.max(0, total - paid);

    const items = Array.isArray(order.items)
        ? order.items
        : [];

    orderDetail.innerHTML = `
        <div class="order-summary">

            <div class="order-detail-header">

                <div>
                    <h3>
                        ${escapeHTML(order.order_number)}
                    </h3>

                    <p class="customer-name">
                        ${escapeHTML(order.customer_name)}
                    </p>
                </div>

                <div class="order-detail-status">
                    <span class="status-badge status-${escapeHTML(
                        String(order.status || "").toLowerCase()
                    )}">
                        ${escapeHTML(order.status)}
                    </span>

                    <span class="status-badge payment-${escapeHTML(
                        String(order.payment_status || "").toLowerCase()
                    )}">
                        ${escapeHTML(order.payment_status)}
                    </span>
                </div>

            </div>


            <div class="order-info">

                <p>
                    <strong>Phone:</strong>
                    ${escapeHTML(order.customer_phone) || "—"}
                </p>

                <p>
                    <strong>Pickup:</strong>
                    ${escapeHTML(order.pickup_date)}
                    ${order.pickup_time
                        ? ` at ${escapeHTML(order.pickup_time)}`
                        : ""
                    }
                </p>

            </div>


            <div class="status-control">

                <strong>Order Status:</strong>

                <select id="order-status">
    <option value="NEW" ${order.status === "NEW" ? "selected" : ""}>
        NEW
    </option>

    <option value="CONFIRMED" ${order.status === "CONFIRMED" ? "selected" : ""}>
        CONFIRMED
    </option>

    <option value="READY" ${order.status === "READY" ? "selected" : ""}>
        READY
    </option>

    <option value="COMPLETED" ${order.status === "COMPLETED" ? "selected" : ""}>
        COMPLETED
    </option>

    <option value="CANCELLED" ${order.status === "CANCELLED" ? "selected" : ""}>
        CANCELLED
    </option>
</select>

<button id="save-order-status">
    Save
</button>

            </div>


            <div class="payment-section">

    <h3>Payment</h3>

    <div class="payment-summary">

        <div>
            <span>Total</span>
            <strong>${formatMoney(total)}</strong>
        </div>

        <div>
            <span>Paid</span>
            <strong>${formatMoney(paid)}</strong>
        </div>

        <div>
            <span>Balance</span>
            <strong>${formatMoney(balance)}</strong>
        </div>

    </div>

    <div class="payment-section">

    <div class="payment-section-header">
        <h3>Payments</h3>

        <button
            type="button"
            id="refresh-payments"
        >
            Refresh Payments
        </button>
    </div>

    <div id="payment-history">
        <p>Loading payments...</p>
    </div>

</div>

    

    ${
        balance > 0
            ? `
                <div class="payment-control">

                    <input
                        type="number"
                        id="payment-amount"
                        min="0.01"
                        max="${balance.toFixed(2)}"
                        step="0.01"
                        value="${balance.toFixed(2)}"
                        inputmode="decimal"
                    >

                    <select id="payment-method">

                        <option value="CASH">
                            CASH
                        </option>

                        <option value="BANK_TRANSFER">
                            BANK TRANSFER
                        </option>

                    </select>

                    <button
                        type="button"
                        id="record-payment"
                    >
                        Record Payment
                    </button>

                </div>
            `
            : `
                <p class="payment-complete">
                    ✓ Fully Paid
                </p>
            `
    }

</div>


            <h3>Items</h3>

            <div class="order-items">

                ${
                    items.length === 0
                        ? `
                            <p>
                                No items on this order.
                            </p>
                        `
                        : items.map(renderOrderItem).join("")
                }

            </div>


            ${
                order.notes
                    ? `
                        <div class="order-notes">

                            <strong>Notes:</strong>

                            <p>
                                ${escapeHTML(order.notes)}
                            </p>

                        </div>
                    `
                    : ""
            }

        </div>
    `;

    attachOrderDetailListeners(order);
    loadPaymentHistory(order.id);
}

// =========================================================
// Payment History
// =========================================================

async function loadPaymentHistory(orderId) {

    const paymentHistory =
        document.getElementById("payment-history");

    if (!paymentHistory) {
        return;
    }

    paymentHistory.innerHTML = `
        <p class="loading">
            Loading payments...
        </p>
    `;

    try {

        const response = await fetch(
            `/api/orders/${orderId}/payments`
        );

        if (!response.ok) {
            throw new Error(
                `Server returned ${response.status}.`
            );
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(
                result.error ||
                "Failed to load payments."
            );
        }

        renderPaymentHistory(result.data);

    } catch (error) {

        console.error(
            "loadPaymentHistory error:",
            error
        );

        paymentHistory.innerHTML = `
            <p class="error">
                ${escapeHTML(error.message)}
            </p>
        `;
    }
}


function renderPaymentHistory(payments) {

    const paymentHistory =
        document.getElementById("payment-history");

    if (!paymentHistory) {
        return;
    }

    if (
        !Array.isArray(payments) ||
        payments.length === 0
    ) {

        paymentHistory.innerHTML = `
            <p>
                No payments recorded.
            </p>
        `;

        return;
    }

    paymentHistory.innerHTML = payments.map(
        payment => `

            <div class="payment-record">

                <div>

                    <strong>
                        ${escapeHTML(
                            payment.payment_method
                        )}
                    </strong>

                    <span>
                        ${escapeHTML(
                            payment.created_at
                        )}
                    </span>

                </div>

                <strong>
                    ${formatMoney(payment.amount)}
                </strong>

            </div>

        `
    ).join("");
}


// =========================================================
// Order Item Rendering
// =========================================================

function renderOrderItem(item) {
    const quantity = Number(item.quantity) || 0;
    const pickedUp = Number(item.quantity_picked_up) || 0;
    const remaining = Math.max(
        0,
        Number(item.quantity_remaining) || 0
    );

    return `
        <div class="order-item">

            <div class="item-main">

                <strong>
                    ${escapeHTML(item.product_name)}
                </strong>

                <span>
                    Qty: ${quantity}
                </span>

                <span>
                    ${formatMoney(item.unit_price)}
                    each
                </span>

            </div>


            <div class="item-production">

                <label>
                    Production:
                </label>

                <select
                    class="production-status"
                    data-item-id="${Number(item.id)}"
                >

                    <option
                        value="PENDING"
                        ${item.production_status === "PENDING"
                            ? "selected"
                            : ""
                        }
                    >
                        PENDING
                    </option>

                    <option
                        value="IN_PROGRESS"
                        ${item.production_status === "IN_PROGRESS"
                            ? "selected"
                            : ""
                        }
                    >
                        IN_PROGRESS
                    </option>

                    <option
                        value="READY"
                        ${item.production_status === "READY"
                            ? "selected"
                            : ""
                        }
                    >
                        READY
                    </option>

                    <option
                        value="COMPLETED"
                        ${item.production_status === "COMPLETED"
                            ? "selected"
                            : ""
                        }
                    >
                        COMPLETED
                    </option>

                </select>

                <span class="pickup-progress">
                    Picked up:
                    ${pickedUp}/${quantity}
                </span>

            </div>


            <div class="item-pickup">

                ${
                    remaining > 0
                        ? `
                            <div class="pickup-control">

                                <input
                                    type="number"
                                    class="pickup-quantity"
                                    data-item-id="${Number(item.id)}"
                                    data-remaining="${remaining}"
                                    min="1"
                                    max="${remaining}"
                                    step="1"
                                    value="1"
                                    inputmode="numeric"
                                >

                                <button
                                    type="button"
                                    class="pickup-item"
                                    data-item-id="${Number(item.id)}"
                                    data-remaining="${remaining}"
                                >
                                    Pick Up
                                </button>

                            </div>

                            <small>
                                ${remaining}
                                remaining
                            </small>
                        `
                        : `
                            <span class="pickup-complete">
                                ✓ Fully Picked Up
                            </span>
                        `
                }

            </div>


            <strong class="item-total">
                ${formatMoney(item.line_total)}
            </strong>

        </div>
    `;
}


// =========================================================
// Order Detail Event Listeners
// =========================================================

function attachOrderDetailListeners(order) {

    // -----------------------------------------------------
    // Overall Order Status
    // -----------------------------------------------------

    const saveStatusButton =
        document.getElementById("save-order-status");

    if (saveStatusButton) {

        saveStatusButton.addEventListener(
            "click",
            async () => {

                const status =
                    document.getElementById("order-status").value;

                saveStatusButton.disabled = true;
                saveStatusButton.textContent = "Saving...";

                try {

                    const response = await fetch(
                        `/api/orders/${order.id}/status`,
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                status
                            })
                        }
                    );

                    const result =
                        await response.json();

                    if (!result.success) {
                        throw new Error(
                            result.error ||
                            "Failed to update status."
                        );
                    }

                    renderOrderDetail(result.data);

                } catch (error) {

                    console.error(
                        "update order status error:",
                        error
                    );

                    alert(error.message);

                    saveStatusButton.disabled = false;
                    saveStatusButton.textContent = "Save";
                }
            }
        );

    }
    const refreshPaymentsButton =
        document.getElementById("refresh-payments");

    if (refreshPaymentsButton) {
        refreshPaymentsButton.addEventListener(
            "click",
            () => loadPaymentHistory(order.id)
        );
    }


    // -----------------------------------------------------
    // Production Status
    // -----------------------------------------------------

    document
        .querySelectorAll(".production-status")
        .forEach(select => {

            select.addEventListener(
                "change",
                async () => {

                    const itemId =
                        Number(select.dataset.itemId);

                    const production_status =
                        select.value;

                    select.disabled = true;

                    try {

                        const response =
                            await fetch(
                                `/api/orders/${order.id}/items/${itemId}/status`,
                                {
                                    method: "PUT",
                                    headers: {
                                        "Content-Type":
                                            "application/json"
                                    },
                                    body: JSON.stringify({
                                        production_status
                                    })
                                }
                            );

                        const result =
                            await response.json();

                        if (!result.success) {
                            throw new Error(
                                result.error ||
                                "Failed to update production status."
                            );
                        }

                        renderOrderDetail(result.data);

                    } catch (error) {

                        console.error(
                            "update production status error:",
                            error
                        );

                        alert(error.message);

                        await loadOrderDetail(order.id);
                    }
                }
            );
        });


    // -----------------------------------------------------
    // Partial Pickup
    // -----------------------------------------------------

    document
        .querySelectorAll(".pickup-item")
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    const itemId =
                        Number(button.dataset.itemId);

                    const input =
                        document.querySelector(
                            `.pickup-quantity[data-item-id="${itemId}"]`
                        );

                    if (!input) {
                        return;
                    }

                    const remaining =
                        Number(input.dataset.remaining);

                    const quantity =
                        Number(input.value);

                    // Client-side validation.
                    // The server remains authoritative.
                    if (
                        !Number.isInteger(quantity) ||
                        quantity <= 0
                    ) {

                        alert(
                            "Pickup quantity must be a whole number greater than zero."
                        );

                        input.focus();
                        return;
                    }

                    if (quantity > remaining) {

                        alert(
                            `Only ${remaining} item(s) remain to be picked up.`
                        );

                        input.focus();
                        return;
                    }

                    button.disabled = true;
                    button.textContent = "Recording...";

                    try {

                        const response =
                            await fetch(
                                `/api/orders/${order.id}/items/${itemId}/pickup`,
                                {
                                    method: "POST",
                                    headers: {
                                        "Content-Type":
                                            "application/json"
                                    },
                                    body: JSON.stringify({
                                        quantity
                                    })
                                }
                            );

                        const result =
                            await response.json();

                        if (!result.success) {
                            throw new Error(
                                result.error ||
                                "Failed to record pickup."
                            );
                        }

                        renderOrderDetail(result.data);

                    } catch (error) {

                        console.error(
                            "record pickup error:",
                            error
                        );

                        alert(error.message);

                        button.disabled = false;
                        button.textContent = "Pick Up";
                    }
                }
            );
        });
    
    // -----------------------------------------------------
    // Payment
    // -----------------------------------------------------

const recordPaymentButton =
    document.getElementById("record-payment");

if (recordPaymentButton) {

    recordPaymentButton.addEventListener(
        "click",
        async () => {

            const amountInput =
                document.getElementById("payment-amount");

            const paymentMethodInput =
                document.getElementById("payment-method");

            if (!amountInput || !paymentMethodInput) {
                return;
            }

            const amount =
                Number(amountInput.value);

            const payment_method =
                paymentMethodInput.value;

            const total =
                Number(order.total_amount) || 0;

            const paid =
                Number(order.amount_paid) || 0;

            const balance =
                Math.max(0, total - paid);

            if (
                !Number.isFinite(amount) ||
                amount <= 0
            ) {
                alert(
                    "Payment amount must be greater than zero."
                );

                amountInput.focus();
                return;
            }

            if (amount > balance) {
                alert(
                    `Payment cannot exceed the remaining balance of ${formatMoney(balance)}.`
                );

                amountInput.focus();
                return;
            }

            recordPaymentButton.disabled = true;
            recordPaymentButton.textContent =
                "Recording...";

            try {

                const response =
                    await fetch(
                        `/api/orders/${order.id}/payments`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/json"
                            },
                            body: JSON.stringify({
                                amount,
                                payment_method
                            })
                        }
                    );

                const result =
                    await response.json();

                if (!result.success) {
                    throw new Error(
                        result.error ||
                        "Failed to record payment."
                    );
                }

                renderOrderDetail(result.data);

            } catch (error) {

                console.error(
                    "record payment error:",
                    error
                );

                alert(error.message);

                recordPaymentButton.disabled =
                    false;

                recordPaymentButton.textContent =
                    "Record Payment";
            }
        }
    );
}
}

// =========================================================
// New Order Form
// =========================================================

function renderNewOrderForm() {

    const today = new Date()
        .toISOString()
        .split("T")[0];

    newOrderForm.innerHTML = `
        <form id="create-order-form">

            <div class="form-group">

                <label for="order-number">
                    Order Number
                </label>

                <input
                    type="text"
                    id="order-number"
                    required
                >

        </div>

            <div class="form-group">

                <label for="customer-id">
                    Customer ID
                </label>

                <input
                    type="number"
                    id="customer-id"
                    min="1"
                    step="1"
                    required
                >

            </div>


            <div class="form-group">

                <label for="pickup-date">
                    Pickup Date
                </label>

                <input
                    type="date"
                    id="pickup-date"
                    value="${today}"
                    required
                >

            </div>


            <div class="form-group">

                <label for="pickup-time">
                    Pickup Time
                </label>

                <input
                    type="time"
                    id="pickup-time"
                >

            </div>


            <div class="form-group checkbox-group">

                <label>
                    <input
                        type="checkbox"
                        id="delivery"
                    >

                    Delivery
                </label>

            </div>


            <div
                class="form-group hidden"
                id="delivery-address-group"
            >

                <label for="delivery-address">
                    Delivery Address
                </label>

                <textarea
                    id="delivery-address"
                    rows="3"
                ></textarea>

            </div>


            <div class="form-group">

                <label for="order-notes-input">
                    Notes
                </label>

                <textarea
                    id="order-notes-input"
                    rows="4"
                ></textarea>

            </div>


            <button type="submit">
                Create Order
            </button>

        </form>
    `;

    attachNewOrderFormListeners();
}
function attachNewOrderFormListeners() {

    const deliveryCheckbox =
        document.getElementById("delivery");

    const deliveryAddressGroup =
        document.getElementById(
            "delivery-address-group"
        );

    deliveryCheckbox.addEventListener(
        "change",
        () => {

            if (deliveryCheckbox.checked) {
                deliveryAddressGroup.classList.remove(
                    "hidden"
                );
            } else {
                deliveryAddressGroup.classList.add(
                    "hidden"
                );

                document.getElementById(
                    "delivery-address"
                ).value = "";
            }
            
        }
    );
    
        const createOrderForm =
        document.getElementById("create-order-form");

    createOrderForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const orderNumber =
                document.getElementById("order-number").value.trim();

            const customerId = Number(
                document.getElementById("customer-id").value
            );

            const pickupDate =
                document.getElementById("pickup-date").value;

            const pickupTime =
                document.getElementById("pickup-time").value;

            const delivery =
                document.getElementById("delivery").checked;

            const deliveryAddress =
                document.getElementById("delivery-address").value.trim();

            const notes =
                document.getElementById("order-notes-input").value.trim();

            if (!orderNumber) {
                alert("Please enter an order number.");
                return;
            }

            if (
                !Number.isInteger(customerId) ||
                customerId <= 0
            ) {
                alert("Please enter a valid customer ID.");
                return;
            }

            if (!pickupDate) {
                alert("Please select a pickup date.");
                return;
            }

            if (
                delivery &&
                !deliveryAddress
            ) {
                alert(
                    "Please enter a delivery address."
                );
                return;
            }


            const submitButton =
                createOrderForm.querySelector(
                    'button[type="submit"]'
                );

            submitButton.disabled = true;
            submitButton.textContent =
                "Creating...";


            try {

                const response =
                    await fetch(
                        "/api/orders",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/json"
                            },
                            body: JSON.stringify({
                                order_number: orderNumber,
                                customer_id: customerId,
                                pickup_date: pickupDate,
                                pickup_time:
                                    pickupTime || null,
                                delivery: delivery
                                    ? 1
                                    : 0,
                                delivery_address: delivery
                                    ? deliveryAddress
                                    : null,
                                notes: notes || null
                            })
                        }
                    );


                const result =
                    await response.json();

                    console.log(
    "Create order response:",
    response.status,
    result
);


                if (!response.ok || !result.success) {
                    throw new Error(
                        result.error ||
                        "Failed to create order."
                    );
                }


                newOrderView.classList.add("hidden");

                orderDetailView.classList.remove(
                    "hidden"
                );

                renderOrderDetail(result.data);


            } catch (error) {

                console.error(
                    "create order error:",
                    error
                );

                alert(error.message);

                submitButton.disabled = false;
                submitButton.textContent =
                    "Create Order";
            }
        }
    );
}



// =========================================================
// Navigation
// =========================================================

// Open New Order view

document
    .getElementById("new-order")
    .addEventListener(
        "click",
        () => {

            ordersView.classList.add("hidden");
            orderDetailView.classList.add("hidden");

            newOrderView.classList.remove("hidden");

            renderNewOrderForm();
        }
    );


// Cancel New Order and return to Orders

document
    .getElementById("cancel-new-order")
    .addEventListener(
        "click",
        () => {

            newOrderView.classList.add("hidden");

            ordersView.classList.remove("hidden");

            loadOrders();
        }
    );


// Back from Order Detail to Orders

document
    .getElementById("back-to-orders")
    .addEventListener(
        "click",
        () => {

            orderDetailView.classList.add("hidden");
            ordersView.classList.remove("hidden");

            loadOrders();
        }
    );


document
    .getElementById("back-to-orders")
    .addEventListener(
        "click",
        () => {

            orderDetailView.classList.add("hidden");
            ordersView.classList.remove("hidden");

            loadOrders();
        }
    );

document
    .getElementById("new-order")
    .addEventListener(
        "click",
        () => {

            ordersView.classList.add("hidden");
            orderDetailView.classList.add("hidden");
            newOrderView.classList.remove("hidden");

        }
    );


document
    .getElementById("cancel-new-order")
    .addEventListener(
        "click",
        () => {

            newOrderView.classList.add("hidden");
            ordersView.classList.remove("hidden");

        }
    );


// =========================================================
// Initial Load
// =========================================================

loadOrders();