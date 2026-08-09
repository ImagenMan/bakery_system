const ordersView = document.getElementById("orders-view");
const orderDetailView = document.getElementById("order-detail-view");
const ordersList = document.getElementById("orders-list");
const orderDetail = document.getElementById("order-detail");

async function loadOrders() {
    ordersList.innerHTML = '<p class="loading">Loading orders...</p>';

    try {
        const response = await fetch("/api/orders");
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || "Failed to load orders.");
        }

        renderOrders(result.data);
    } catch (error) {
        ordersList.innerHTML = `
            <p class="error">${error.message}</p>
        `;
    }
}

function renderOrders(orders) {
    if (!orders.length) {
        ordersList.innerHTML = "<p>No orders found.</p>";
        return;
    }

    ordersList.innerHTML = orders.map(order => `
        <div class="order-card" data-order-id="${order.id}">
            <div>
                <strong>${order.order_number}</strong>
                <span>${order.customer_name}</span>
            </div>

            <div>
                <span>${order.pickup_date}</span>
                <span>${order.pickup_time || ""}</span>
            </div>

            <div>
                <span>${order.status}</span>
                <span>${order.payment_status}</span>
            </div>

            <strong>$${Number(order.total_amount).toFixed(2)}</strong>
        </div>
    `).join("");

    document.querySelectorAll(".order-card").forEach(card => {
        card.addEventListener("click", () => {
            loadOrderDetail(card.dataset.orderId);
        });
    });
}

async function loadOrderDetail(orderId) {
    ordersView.classList.add("hidden");
    orderDetailView.classList.remove("hidden");

    orderDetail.innerHTML = '<p class="loading">Loading order...</p>';

    try {
        const response = await fetch(`/api/orders/${orderId}`);
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || "Failed to load order.");
        }

        renderOrderDetail(result.data);
    } catch (error) {
        orderDetail.innerHTML = `
            <p class="error">${error.message}</p>
        `;
    }
}

function renderOrderDetail(order) {
    const balance = Number(order.total_amount) - Number(order.amount_paid);

    orderDetail.innerHTML = `
        <div class="order-summary">

            <h3>${order.order_number}</h3>

            <p>
                <strong>Customer:</strong>
                ${order.customer_name}
            </p>

            <p>
                <strong>Phone:</strong>
                ${order.customer_phone || "—"}
            </p>

            <p>
                <strong>Pickup:</strong>
                ${order.pickup_date}
                ${order.pickup_time || ""}
            </p>

            <p>
                <strong>Order Status:</strong>
                ${order.status}
            </p>

            <p>
                <strong>Payment:</strong>
                ${order.payment_status}
            </p>

            <div class="payment-summary">
                <p><strong>Total:</strong> $${Number(order.total_amount).toFixed(2)}</p>
                <p><strong>Paid:</strong> $${Number(order.amount_paid).toFixed(2)}</p>
                <p><strong>Balance:</strong> $${balance.toFixed(2)}</p>
            </div>

            <h3>Items</h3>

            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item">
                        <div>
                            <strong>${item.product_name}</strong>
                            <span>Qty: ${item.quantity}</span>
                        </div>

                        <div>
                            <span>${item.production_status}</span>
                            <span>
                                Picked up:
                                ${item.quantity_picked_up}/${item.quantity}
                            </span>
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
                    <p>${order.notes}</p>
                </div>
            ` : ""}

        </div>
    `;
}

document.getElementById("refresh-orders")
    .addEventListener("click", loadOrders);

document.getElementById("back-to-orders")
    .addEventListener("click", () => {
        orderDetailView.classList.add("hidden");
        ordersView.classList.remove("hidden");
    });

loadOrders();