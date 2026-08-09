const socket = io();

const connectionStatus = document.getElementById("connection-status");
const ordersList = document.getElementById("orders-list");
const refreshButton = document.getElementById("refresh-orders");


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
        console.error("Failed to load orders:", error);

        ordersList.innerHTML = `
            <p class="error">
                Failed to load orders.
            </p>
        `;
    }
}


function renderOrders(orders) {
    if (!orders.length) {
        ordersList.innerHTML = `
            <p class="empty">
                No orders found.
            </p>
        `;
        return;
    }

    ordersList.innerHTML = orders.map(order => `
        <article class="order-card">

            <div class="order-main">

                <div>
                    <h3>${escapeHtml(order.order_number)}</h3>
                    <p class="customer">
                        ${escapeHtml(order.customer_name || "No customer")}
                    </p>
                </div>

                <div class="order-status">
                    <span class="status status-${order.status.toLowerCase()}">
                        ${escapeHtml(order.status)}
                    </span>

                    <span class="payment payment-${order.payment_status.toLowerCase()}">
                        ${escapeHtml(order.payment_status)}
                    </span>
                </div>

            </div>

            <div class="order-details">

                <span>
                    📅 ${escapeHtml(order.pickup_date || "No date")}
                </span>

                <span>
                    🕐 ${escapeHtml(order.pickup_time || "No time")}
                </span>

                <span>
                    💰 $${Number(order.total_amount || 0).toFixed(2)}
                </span>

            </div>

        </article>
    `).join("");
}


function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
}


refreshButton.addEventListener("click", loadOrders);


socket.on("connect", () => {
    connectionStatus.textContent = "● Connected";
    connectionStatus.className = "connected";

    loadOrders();
});


socket.on("disconnect", () => {
    connectionStatus.textContent = "● Disconnected";
    connectionStatus.className = "disconnected";
});