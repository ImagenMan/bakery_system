// --- DOM Elements ---
const ordersView = document.getElementById("orders-view");
const orderDetailView = document.getElementById("order-detail-view");
const ordersList = document.getElementById("orders-list");
const orderDetail = document.getElementById("order-detail");

// --- Utility Functions ---
/**
 * Escapes unsafe characters to prevent Cross-Site Scripting (XSS)
 */
function escapeHTML(str) {
    if (str === null || str === undefined) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// --- Order List Functions ---
async function loadOrders() {
    ordersList.innerHTML = `<p class="loading">Loading orders...</p>`;

    try {
        const response = await fetch("/api/orders");
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || "Failed to load orders.");
        }

        renderOrders(result.data);
    } catch (error) {
        ordersList.innerHTML = `<p class="error">${escapeHTML(error.message)}</p>`;
    }
}

function renderOrders(orders) {
    if (!orders || !orders.length) {
        ordersList.innerHTML = "<p>No orders found.</p>";
        return;
    }

    ordersList.innerHTML = orders.map(order => `
        <div class="order-card" data-order-id="${order.id}">
            <div>
                <strong>${escapeHTML(order.order_number)}</strong>
                <span>${escapeHTML(order.customer_name)}</span>
            </div>

            <div>
                <span>${escapeHTML(order.pickup_date)}</span>
                <span>${escapeHTML(order.pickup_time) || ""}</span>
            </div>

            <div>
                <span>${escapeHTML(order.status)}</span>
                <span>${escapeHTML(order.payment_status)}</span>
            </div>

            <strong>
                $${Number(order.total_amount).toFixed(2)}
            </strong>
        </div>
    `).join("");

    // Event listeners for clicking an order card to view details
    document.querySelectorAll(".order-card").forEach(card => {
        card.addEventListener("click", () => {
            loadOrderDetail(card.dataset.orderId);
        });
    });
}

// --- Order Detail Functions ---
async function loadOrderDetail(orderId) {
    ordersView.classList.add("hidden");
    orderDetailView.classList.remove("hidden");

    orderDetail.innerHTML = `<p class="loading">Loading order...</p>`;

    try {
        const response = await fetch(`/api/orders/${orderId}`);
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || "Failed to load order.");
        }

        renderOrderDetail(result.data);
    } catch (error) {
        orderDetail.innerHTML = `<p class="error">${escapeHTML(error.message)}</p>`;
    }
}

function renderOrderDetail(order) {
    const balance = Number(order.total_amount) - Number(order.amount_paid);

    orderDetail.innerHTML = `
        <div class="order-summary">

            <h3>${escapeHTML(order.order_number)}</h3>

            <p>
                <strong>Customer:</strong>
                ${escapeHTML(order.customer_name)}
            </p>

            <p>
                <strong>Phone:</strong>
                ${escapeHTML(order.customer_phone) || "—"}
            </p>

            <p>
                <strong>Pickup:</strong>
                ${escapeHTML(order.pickup_date)}
                ${escapeHTML(order.pickup_time) || ""}
            </p>

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
                </select>

                <button id="save-order-status">Save</button>
            </div>

            <p>
                <strong>Payment:</strong>
                ${escapeHTML(order.payment_status)}
            </p>

            <div class="payment-summary">
                <p>
                    <strong>Total:</strong>
                    $${Number(order.total_amount).toFixed(2)}
                </p>
                <p>
                    <strong>Paid:</strong>
                    $${Number(order.amount_paid).toFixed(2)}
                </p>
                <p>
                    <strong>Balance:</strong>
                    $${balance.toFixed(2)}
                </p>
            </div>

            <h3>Items</h3>

            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item">
                        <div>
                            <strong>${escapeHTML(item.product_name)}</strong>
                            <span>Qty: ${item.quantity}</span>
                        </div>

                        <div class="item-production">
                            <label>Production:</label>

                            <select class="production-status" data-item-id="${item.id}">
                                <option value="PENDING" ${item.production_status === "PENDING" ? "selected" : ""}>
                                    PENDING
                                </option>
                                <option value="READY" ${item.production_status === "READY" ? "selected" : ""}>
                                    READY
                                </option>
                                <option value="COMPLETED" ${item.production_status === "COMPLETED" ? "selected" : ""}>
                                    COMPLETED
                                </option>
                            </select>

                            <span>
                                Picked up: ${item.quantity_picked_up}/${item.quantity}
                            </span>

                            ${item.quantity_remaining > 0 ? `
                                <button class="pickup-item" data-item-id="${item.id}" data-remaining="${item.quantity_remaining}">
                                    Pick Up
                                </button>
                            ` : `
                                <span class="pickup-complete">✓ Picked Up</span>
                            `}
                        </div>

                        <strong>
                            $${Number(item.line_total).toFixed(2)}
                        </strong>
                    </div>
                `).join("")}
            </div>

            ${order.notes ? `
                <div class="order-notes">
                    <strong>Notes:</strong>
                    <p>${escapeHTML(order.notes)}</p>
                </div>
            ` : ""}

        </div>
    `;

    // --- Attach Event Listeners inside renderOrderDetail ---

    // 1. Update overall Order Status
    document
        .getElementById("save-order-status")
        .addEventListener("click", async () => {
            const status = document.getElementById("order-status").value;

            try {
                const response = await fetch(`/api/orders/${order.id}/status`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status })
                });

                const result = await response.json();

                if (!result.success) {
                    throw new Error(result.error || "Failed to update status.");
                }

                renderOrderDetail(result.data);
            } catch (error) {
                alert(error.message);
            }
        });

    // 2. Update Production Status per Item
    document
        .querySelectorAll(".production-status")
        .forEach(select => {
            select.addEventListener("change", async () => {
                const itemId = Number(select.dataset.itemId);
                const production_status = select.value;

                try {
                    const response = await fetch(
                        `/api/orders/${order.id}/items/${itemId}/status`,
                        {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ production_status })
                        }
                    );

                    const result = await response.json();

                    if (!result.success) {
                        throw new Error(
                            result.error || "Failed to update production status."
                        );
                    }

                    renderOrderDetail(result.data);
                } catch (error) {
                    alert(error.message);
                    // Re-render order to revert select to actual state
                    loadOrderDetail(order.id);
                }
            });
        });

    // 3. Pickup Item Buttons (Fixed: Now correctly scoped inside renderOrderDetail)
    document
        .querySelectorAll(".pickup-item")
        .forEach(button => {
            button.addEventListener("click", async () => {
                const itemId = Number(button.dataset.itemId);
                const remaining = Number(button.dataset.remaining);

                try {
                    const response = await fetch(
                        `/api/orders/${order.id}/items/${itemId}/pickup`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ quantity: remaining })
                        }
                    );

                    const result = await response.json();

                    if (!result.success) {
                        throw new Error(
                            result.error || "Failed to record pickup."
                        );
                    }

                    renderOrderDetail(result.data);
                } catch (error) {
                    alert(error.message);
                }
            });
        });
}

// --- Global Navigation & Event Listeners ---
document
    .getElementById("refresh-orders")
    .addEventListener("click", loadOrders);

document
    .getElementById("back-to-orders")
    .addEventListener("click", () => {
        orderDetailView.classList.add("hidden");
        ordersView.classList.remove("hidden");
    });

// Initial App Load
loadOrders();