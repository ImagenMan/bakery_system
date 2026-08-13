// =========================================================
// Bakery System
// Orders UI
// =========================================================

// --- DOM Elements ---

const ordersView = document.getElementById("orders-view");
const orderDetailView = document.getElementById("order-detail-view");
const ordersList = document.getElementById("orders-list");
const orderDetail = document.getElementById("order-detail");


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
}


// =========================================================
// Navigation
// =========================================================

document
    .getElementById("refresh-orders")
    .addEventListener(
        "click",
        loadOrders
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


// =========================================================
// Initial Load
// =========================================================

loadOrders();