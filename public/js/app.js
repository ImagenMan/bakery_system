// =========================================================
// Bakery System
// Orders UI
// =========================================================

// --- DOM Elements ---

const loginView = document.getElementById("login-view");
const ordersView = document.getElementById("orders-view");
const orderDetailView = document.getElementById("order-detail-view");
const newOrderView = document.getElementById("new-order-view");
const counterSaleView = document.getElementById("counter-sale-view");
const productionView = document.getElementById("production-view");

const loginForm = document.getElementById("login-form");
const loginUsername = document.getElementById("login-username");
const loginPassword = document.getElementById("login-password");
const loginError = document.getElementById("login-error");

const ordersList = document.getElementById("orders-list");
const orderDetail = document.getElementById("order-detail");
const newOrderForm = document.getElementById("new-order-form");

const counterSaleCustomer = document.getElementById("counter-sale-customer");
const counterSaleCategoryList = document.getElementById("counter-sale-category-list");
const counterSaleProductList = document.getElementById("counter-sale-product-list");
const counterSaleCustomProductList = document.getElementById("counter-sale-custom-product-list");
const counterSaleCartElement = document.getElementById("counter-sale-cart");
const counterSaleTotal = document.getElementById("counter-sale-total");
const counterSalePaymentMethod = document.getElementById("counter-sale-payment-method");
const counterSaleCashSection = document.getElementById("counter-sale-cash-section");
const counterSaleCashReceived = document.getElementById("counter-sale-cash-received");
const counterSaleChange = document.getElementById("counter-sale-change");
const counterSalePaymentError = document.getElementById("counter-sale-payment-error");
const completeCounterSale = document.getElementById("complete-counter-sale");

let counterSaleCart = [];
let counterSaleProducts = [];
let counterSaleCategories = [];
let counterSaleSelectedCategoryId = null;

const productionOverview =
    document.getElementById("production-overview");
const productionItemView =
    document.getElementById("production-item-view");

const productionItemTitle =
    document.getElementById("production-item-title");

const productionItemDetail =
    document.getElementById("production-item-detail");

// =========================================================
// Authentication
// =========================================================

function showLogin() {
    loginView.classList.remove("hidden");

    ordersView.classList.add("hidden");
    orderDetailView.classList.add("hidden");
    newOrderView.classList.add("hidden");
    counterSaleView.classList.add("hidden");

    loginUsername.focus();
}


function showApplication() {
    loginView.classList.add("hidden");

    ordersView.classList.remove("hidden");

    loadOrders();
}


async function checkAuthentication() {
    try {
        const response = await fetch("/api/auth/me");

        if (response.status === 401) {
            showLogin();
            return;
        }

        if (!response.ok) {
            throw new Error(
                `Authentication check failed (${response.status}).`
            );
        }

        const result = await response.json();

        if (!result.success) {
            showLogin();
            return;
        }

        showApplication();

    } catch (error) {
        console.error(
            "Authentication check error:",
            error
        );

        loginError.textContent =
            "Unable to connect to the server.";

        loginError.classList.remove("hidden");

        showLogin();
    }
}


loginForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        loginError.textContent = "";
        loginError.classList.add("hidden");

        const username =
            loginUsername.value.trim();

        const password =
            loginPassword.value;

        if (!username || !password) {
            loginError.textContent =
                "Username and password are required.";

            loginError.classList.remove("hidden");

            return;
        }

        const submitButton =
            document.getElementById("login-submit");

        submitButton.disabled = true;
        submitButton.textContent = "Logging in...";

        try {

            const response = await fetch(
                "/api/auth/login/password",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        username,
                        password
                    })
                }
            );

            const result =
                await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.error ||
                    "Login failed."
                );
            }

            loginPassword.value = "";

            showApplication();

        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            loginError.textContent =
                error.message;

            loginError.classList.remove("hidden");

        } finally {

            submitButton.disabled = false;
            submitButton.textContent = "Login";
        }
    }
);

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
// Production Overview
// =========================================================

async function loadProductionOverview(date) {

    productionOverview.innerHTML = `
        <p class="loading">
            Loading production...
        </p>
    `;

    try {

        const response = await fetch(
            `/api/production/overview?date=${encodeURIComponent(date)}`
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
                "Failed to load production overview."
            );
        }

        renderProductionOverview(
            result.data,
            date
        );

    } catch (error) {

        console.error(
            "loadProductionOverview error:",
            error
        );

        productionOverview.innerHTML = `
            <p class="error">
                ${escapeHTML(error.message)}
            </p>
        `;
    }
}

// =========================================================
// Production Item
// =========================================================

async function loadProductionItem(
    productionItemId,
    productionDate
) {

    productionView.classList.add("hidden");
    productionItemView.classList.remove("hidden");

    productionItemDetail.innerHTML = `
        <p class="loading">
            Loading production item...
        </p>
    `;

    try {

        // -------------------------------------------------
        // Load production item
        // -------------------------------------------------

        const itemResponse =
            await fetch(
                `/api/production/items/${productionItemId}`
            );

        if (!itemResponse.ok) {
            throw new Error(
                `Server returned ${itemResponse.status}.`
            );
        }

        const itemResult =
            await itemResponse.json();

        if (!itemResult.success) {
            throw new Error(
                itemResult.error ||
                "Failed to load production item."
            );
        }

        const item =
            itemResult.data;


        // -------------------------------------------------
        // Load production plan for this date
        // -------------------------------------------------

        const planResponse =
            await fetch(
                `/api/production/plans/item/${productionItemId}/date/${productionDate}`
            );

        let plan = null;

        if (planResponse.status === 404) {

            plan = null;

        } else {

            if (!planResponse.ok) {
                throw new Error(
                    `Server returned ${planResponse.status}.`
                );
            }

            const planResult =
                await planResponse.json();

            if (!planResult.success) {
                throw new Error(
                    planResult.error ||
                    "Failed to load production plan."
                );
            }

            plan =
                planResult.data;
        }


        // -------------------------------------------------
        // Load demand for this date
        // -------------------------------------------------

        const demandResponse =
            await fetch(
                `/api/production/demand?date=${encodeURIComponent(productionDate)}`
            );

        if (!demandResponse.ok) {
            throw new Error(
                `Server returned ${demandResponse.status}.`
            );
        }

        const demandResult =
            await demandResponse.json();

        if (!demandResult.success) {
            throw new Error(
                demandResult.error ||
                "Failed to load production demand."
            );
        }

        const demandItem =
            demandResult.data.find(
                row =>
                    Number(row.production_item_id) ===
                    Number(productionItemId)
            );

        // -------------------------------------------------
        // Load production totals
        // -------------------------------------------------

        let totals = {
            total_produced: 0
        };

        if (
            plan &&
            Number.isInteger(Number(plan.id)) &&
            Number(plan.id) > 0
        ) {

            const totalsResponse =
                await fetch(
                    `/api/production/plans/${Number(plan.id)}/totals`
                );

            if (!totalsResponse.ok) {
                throw new Error(
                    `Server returned ${totalsResponse.status}.`
                );
            }

            const totalsResult =
                await totalsResponse.json();

            if (!totalsResult.success) {
                throw new Error(
                    totalsResult.error ||
                    "Failed to load production totals."
                );
            }

            totals =
                totalsResult.data;
        }

        // -------------------------------------------------
        // Render
        // -------------------------------------------------

        renderProductionItem(
            {
                ...item,

                demand_quantity:
                    demandItem
                        ? demandItem.demand_quantity
                        : 0,

                made_quantity:
                    Number(totals.total_produced) || 0
            },
            plan,
            productionDate,
            productionItemId
        );

    } catch (error) {

        console.error(
            "loadProductionItem error:",
            error
        );

        productionItemDetail.innerHTML = `
            <p class="error">
                ${escapeHTML(error.message)}
            </p>
        `;
    }
}

// =========================================================
// Render Production Item
// =========================================================

function renderProductionItem(
    item,
    plan,
    productionDate,
    productionItemId
) {

    productionItemTitle.textContent =
        item.product_name;

    const demand =
        Number(item.demand_quantity) || 0;

    const planned =
        plan
            ? Number(plan.planned_quantity) || 0
            : 0;

    const made =
    Number(item.made_quantity) || 0;

    const toMake =
        Math.max(planned - made, 0);

    productionItemDetail.innerHTML = `

        <div class="production-plan">

            <div>
                <strong>Committed</strong>
                <span>${demand}</span>
            </div>

            <div>
                <strong>Planned</strong>
                <span>${planned}</span>
            </div>

            <div>
                <strong>Made</strong>
                <span>${made}</span>
            </div>

            <div>
                <strong>To Make</strong>
                <span>${toMake}</span>
            </div>


        </div>

                <div class="production-plan-editor">

            <label for="planned-quantity">
                Planned quantity
            </label>

            <input
                type="number"
                id="planned-quantity"
                min="1"
                step="1"
                value="${planned}"
            >

            <button
                type="button"
                id="save-production-plan"
            >
                Save
            </button>

        </div>

        <div class="production-actions">

            <label for="made-quantity">
                Quantity made
            </label>

            <input
                type="number"
                id="made-quantity"
                min="1"
                step="1"
                placeholder="e.g. 50"
            >

            <button
                type="button"
                id="add-made"
            >
                + Made
            </button>

        </div>
    `;

    document
        .getElementById("save-production-plan")
        .addEventListener(
            "click",
            () => {
                saveProductionPlan(
                    item,
                    plan,
                    productionDate
                );
            }
        );

    document
        .getElementById("add-made")
        .addEventListener(
            "click",
            () => {
                recordProductionMade(
                    plan,
                    productionDate,
                    productionItemId
                );
            }
        );

}

async function recordProductionMade(
    plan,
    productionDate,
    productionItemId
) {

    if (!plan || !Number(plan.id)) {
        alert("Save a production plan first.");
        return;
    }

    const button =
        document.getElementById("add-made");

    if (!button) {
        return;
    }

    const input =
        document.getElementById("made-quantity");

    if (!input) {
        return;
    }

    const madeQuantity =
        Number(input.value);

    if (
        !Number.isInteger(madeQuantity) ||
        madeQuantity <= 0
    ) {
        alert(
            "Quantity made must be a positive whole number."
        );

        input.focus();

        return;
    }

    button.disabled = true;
    button.textContent = "Recording...";

    try {

        const response =
            await fetch(
                `/api/production/plans/${Number(plan.id)}/outputs`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        produced_quantity: madeQuantity
                    })
                }
            );

        const result =
            await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.error ||
                "Failed to record production."
            );
        }

        await loadProductionItem(
            productionItemId,
            productionDate
        );

    } catch (error) {

        console.error(
            "recordProductionMade error:",
            error
        );

        alert(
            error.message ||
            "Failed to record production."
        );

        button.disabled = false;
        button.textContent = "+ Made";
    }
}

// =========================================================
// Render Production Overview
// =========================================================

function renderProductionOverview(
    items,
    productionDate
) {

    if (!Array.isArray(items) || items.length === 0) {

        productionOverview.innerHTML = `
            <p>No production demand for this date.</p>
        `;

        return;
    }

    productionOverview.innerHTML = items.map(item => {

        const demand =
            Number(item.demand_quantity) || 0;

        const planned =
            Number(item.planned_quantity) || 0;

        const made =
            Number(item.made_quantity) || 0;

        const toMake =
            Math.max(planned - made, 0);

        const productionItemId =
            Number(item.production_item_id);

        return `
            <button
                type="button"
                class="production-item"
                data-production-item-id="${productionItemId}"
            >

                <strong>
                    ${escapeHTML(item.product_name)}
                </strong>

                <span>
                    ${demand} committed
                    ·
                    ${planned} planned
                    ·
                    ${toMake} to make
                    ·
                    ${made} made
                </span>

            </button>
        `;

    }).join("");

    document
        .querySelectorAll(".production-item")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const productionItemId =
                        Number(
                            button.dataset.productionItemId
                        );

                    if (
                        !Number.isInteger(productionItemId) ||
                        productionItemId <= 0
                    ) {
                        return;
                    }

                    loadProductionItem(
                        productionItemId,
                        productionDate
                    );
                }
            );
        });
}

// =========================================================
// Save Production Plan
// =========================================================

async function saveProductionPlan(
    item,
    plan,
    productionDate
) {

    const input =
        document.getElementById("planned-quantity");

    const saveButton =
        document.getElementById("save-production-plan");

    if (!input || !saveButton) {
        console.error(
            "Production plan controls not found."
        );

        return;
    }

    const productionItemId =
        Number(item && item.id);

    if (
        !Number.isInteger(productionItemId) ||
        productionItemId <= 0
    ) {
        alert(
            "Invalid production item."
        );

        console.error(
            "Invalid production item:",
            item
        );

        return;
    }

    const plannedQuantity =
        Number(input.value);

    if (
        !Number.isInteger(plannedQuantity) ||
        plannedQuantity <= 0
    ) {
        alert(
            "Planned quantity must be a positive whole number."
        );

        input.focus();

        return;
    }

    if (!productionDate) {
        alert(
            "Production date is required."
        );

        return;
    }

    saveButton.disabled = true;
    saveButton.textContent = "Saving...";

    try {

        let response;

        /*
         * Existing plan
         */
        if (
            plan &&
            Number.isInteger(Number(plan.id)) &&
            Number(plan.id) > 0
        ) {

            const planId =
                Number(plan.id);

            response = await fetch(
                `/api/production/plans/${planId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        planned_quantity:
                            plannedQuantity
                    })
                }
            );

        }

        /*
         * No existing plan
         */
        else {

            response = await fetch(
                "/api/production/plans",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        production_item_id:
                            productionItemId,

                        production_date:
                            productionDate,

                        planned_quantity:
                            plannedQuantity
                    })
                }
            );
        }

        const result =
            await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.error ||
                "Failed to save production plan."
            );
        }

        /*
         * Reload the item so the screen reflects
         * the plan that was actually saved.
         */
        await loadProductionItem(
            productionItemId,
            productionDate
        );

    } catch (error) {

        console.error(
            "saveProductionPlan error:",
            error
        );

        alert(
            error.message ||
            "Failed to save production plan."
        );

    } finally {

        saveButton.disabled = false;
        saveButton.textContent = "Save";
    }
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

                <div
                    id="cash-received-field"
                    class="payment-field"
                >

                    <label for="cash-received">
                        Cash Received
                    </label>

                    <input
                        type="number"
                        id="cash-received"
                        min="0"
                        step="0.01"
                        inputmode="decimal"
                        placeholder="0.00"
                    >

                    <p id="cash-change">
                        Change: $0.00
                    </p>

                </div>

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


            <div class="order-items-header">

                <h3>Items</h3>

                <button
                    type="button"
                    id="add-item-button"
                >
                    + Add Item
                </button>

            </div>

            <div
                    id="add-item-form"
                    class="add-item-form hidden"
                >

                <div class="add-item-field">

                    <label for="add-item-category">
                        Category
                    </label>

                    <select id="add-item-category">

                        <option value="">
                            Loading categories...
                        </option>

                    </select>

            </div>


                <div class="add-item-field">

                    <label for="add-item-product">
                        Product
                    </label>

                    <select
                        id="add-item-product"
                        disabled
                    >

                        <option value="">
                            Select a category first...
                        </option>

                    </select>

                </div>


                <div class="add-item-field">

                    <label for="add-item-quantity">
                        Quantity
                    </label>

                    <div class="quantity-control">

                        <button
                            type="button"
                            id="decrease-add-item-quantity"
                        >
                            −
                        </button>

                        <input
                            type="number"
                            id="add-item-quantity"
                            min="1"
                            step="1"
                            value="1"
                            inputmode="numeric"
                        >

                        <button
                            type="button"
                            id="increase-add-item-quantity"
                        >
                            +
                        </button>

                    </div>

                </div>


                <div class="add-item-field">

                    <label for="add-item-notes">
                        Notes
                    </label>

                    <input
                        type="text"
                        id="add-item-notes"
                        placeholder="Optional"
                    >

                </div>


                <div class="add-item-actions">

                    <button
                        type="button"
                        id="cancel-add-item"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        id="save-add-item"
                    >
                        Add to Order
                    </button>

                </div>

                <p
                    id="add-item-error"
                    class="error hidden"
                ></p>

            </div>


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
// Add Item
// =========================================================

async function loadCategoriesForAddItem() {
    const select =
        document.getElementById("add-item-category");

    if (!select) {
        return;
    }

    try {
        const response =
            await fetch("/api/categories");

        if (!response.ok) {
            throw new Error(
                `Server returned ${response.status}.`
            );
        }

        const result =
            await response.json();

        if (!result.success) {
            throw new Error(
                result.error ||
                "Failed to load categories."
            );
        }

        const categories =
            Array.isArray(result.data)
                ? result.data
                : [];

        if (categories.length === 0) {

            select.innerHTML = `
                <option value="">
                    No categories available
                </option>
            `;

            return;
        }

        select.innerHTML = `
            <option value="">
                Select a category...
            </option>

            ${categories.map(category => `
                <option value="${Number(category.id)}">
                    ${escapeHTML(category.name)}
                </option>
            `).join("")}
        `;

    } catch (error) {

        console.error(
            "loadCategoriesForAddItem error:",
            error
        );

        select.innerHTML = `
            <option value="">
                Failed to load categories
            </option>
        `;
    }
}


async function loadProductsForAddItem(categoryId) {
    const select =
        document.getElementById("add-item-product");

    if (!select) {
        return;
    }

    select.disabled = true;

    select.innerHTML = `
        <option value="">
            Loading products...
        </option>
    `;

    try {
        const response =
            await fetch(
                `/api/categories/${Number(categoryId)}/products`
            );

        if (!response.ok) {
            throw new Error(
                `Server returned ${response.status}.`
            );
        }

        const result =
            await response.json();

        if (!result.success) {
            throw new Error(
                result.error ||
                "Failed to load products."
            );
        }

        const products =
            Array.isArray(result.data)
                ? result.data
                : [];

        if (products.length === 0) {

            select.innerHTML = `
                <option value="">
                    No products in this category
                </option>
            `;

            return;
        }

        select.innerHTML = `
            <option value="">
                Select a product...
            </option>

            ${products.map(product => `
                <option value="${Number(product.id)}">
                    ${escapeHTML(product.name)}
                    — ${formatMoney(product.price)}
                </option>
            `).join("")}
        `;

        select.disabled = false;

    } catch (error) {

        console.error(
            "loadProductsForAddItem error:",
            error
        );

        select.innerHTML = `
            <option value="">
                Failed to load products
            </option>
        `;
    }
}


function showAddItemError(message) {

    const errorElement =
        document.getElementById("add-item-error");

    if (!errorElement) {
        return;
    }

    errorElement.textContent = message;
    errorElement.classList.remove("hidden");
}


function clearAddItemError() {

    const errorElement =
        document.getElementById("add-item-error");

    if (!errorElement) {
        return;
    }

    errorElement.textContent = "";
    errorElement.classList.add("hidden");
}


function resetAddItemForm() {

    const form =
        document.getElementById("add-item-form");

    const product =
        document.getElementById("add-item-product");

    const quantity =
        document.getElementById("add-item-quantity");

    const notes =
        document.getElementById("add-item-notes");

    if (!form) {
        return;
    }

    form.classList.add("hidden");

    if (product) {
        product.value = "";
    }

    if (quantity) {
        quantity.value = "1";
    }

    if (notes) {
        notes.value = "";
    }

    clearAddItemError();
}


async function addItemToOrder(orderId) {

    const productSelect =
        document.getElementById("add-item-product");

    const quantityInput =
        document.getElementById("add-item-quantity");

    const notesInput =
        document.getElementById("add-item-notes");

    const saveButton =
        document.getElementById("save-add-item");

    if (
        !productSelect ||
        !quantityInput ||
        !notesInput ||
        !saveButton
    ) {
        return;
    }

    clearAddItemError();

    const productId =
        Number(productSelect.value);

    const quantity =
        Number(quantityInput.value);

    const notes =
        notesInput.value.trim();

    if (
        !Number.isInteger(productId) ||
        productId <= 0
    ) {
        showAddItemError(
            "Please select a product."
        );

        return;
    }

    if (
        !Number.isInteger(quantity) ||
        quantity <= 0
    ) {
        showAddItemError(
            "Quantity must be greater than zero."
        );

        return;
    }

    saveButton.disabled = true;
    saveButton.textContent = "Adding...";

    try {

        const response = await fetch(
            `/api/orders/${Number(orderId)}/items`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    product_id: productId,
                    quantity,
                    notes: notes || null
                })
            }
        );

        const result =
            await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.error ||
                "Failed to add item."
            );
        }

        /*
         * The backend has already recalculated
         * the order total.
         *
         * Reload the complete order so the UI
         * uses the backend as the source of truth.
         */

        await loadOrderDetail(orderId);

    } catch (error) {

        console.error(
            "addItemToOrder error:",
            error
        );

        showAddItemError(
            error.message
        );

        saveButton.disabled = false;
        saveButton.textContent =
            "Add to Order";
    }
}

// =========================================================
// Order Detail Event Listeners
// =========================================================

function attachOrderDetailListeners(order) {

    // -----------------------------------------------------
    // Add Item
    // -----------------------------------------------------

    const addItemButton =
        document.getElementById("add-item-button");

    const addItemForm =
        document.getElementById("add-item-form");

    const cancelAddItemButton =
        document.getElementById("cancel-add-item");

    const saveAddItemButton =
        document.getElementById("save-add-item");

    const decreaseQuantityButton =
    document.getElementById(
        "decrease-add-item-quantity"
    );

    const increaseQuantityButton =
        document.getElementById(
            "increase-add-item-quantity"
        );

    const quantityInput =
        document.getElementById(
            "add-item-quantity"
        );


    if (
        decreaseQuantityButton &&
        quantityInput
    ) {

        decreaseQuantityButton.addEventListener(
            "click",
            () => {

                const currentQuantity =
                    Number(quantityInput.value) || 1;

                quantityInput.value =
                    Math.max(
                        1,
                        currentQuantity - 1
                    );
            }
        );
    }


    if (
        increaseQuantityButton &&
        quantityInput
    ) {

        increaseQuantityButton.addEventListener(
            "click",
            () => {

                const currentQuantity =
                    Number(quantityInput.value) || 1;

                quantityInput.value =
                    currentQuantity + 1;
            }
        );
    }

    if (addItemButton && addItemForm) {

        addItemButton.addEventListener(
            "click",
            async () => {

                addItemForm.classList.remove(
                    "hidden"
                );

                addItemButton.classList.add(
                    "hidden"
                );

                await loadCategoriesForAddItem();

            }
        );

    }

    const categorySelect =
    document.getElementById("add-item-category");

    if (categorySelect) {

        categorySelect.addEventListener(
            "change",
            async () => {

                const categoryId =
                    Number(categorySelect.value);

                if (
                    !Number.isInteger(categoryId) ||
                    categoryId <= 0
                ) {

                    const productSelect =
                        document.getElementById(
                            "add-item-product"
                        );

                    if (productSelect) {

                        productSelect.innerHTML = `
                            <option value="">
                                Select a category first...
                            </option>
                        `;

                        productSelect.disabled = true;
                    }

                    return;
                }

                await loadProductsForAddItem(
                    categoryId
                );
            }
        );
    }


    if (
        cancelAddItemButton &&
        addItemForm &&
        addItemButton
    ) {

        cancelAddItemButton.addEventListener(
            "click",
            () => {

                resetAddItemForm();

                addItemButton.classList.remove(
                    "hidden"
                );

            }
        );

    }


    if (saveAddItemButton) {

        saveAddItemButton.addEventListener(
            "click",
            async () => {

                await addItemToOrder(
                    order.id
                );

            }
        );

    }

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

const paymentMethodInput =
    document.getElementById("payment-method");

const cashReceivedField =
    document.getElementById("cash-received-field");

function updateCashReceivedVisibility() {

    if (!paymentMethodInput || !cashReceivedField) {
        return;
    }

    cashReceivedField.style.display =
        paymentMethodInput.value === "CASH"
            ? ""
            : "none";
}

if (paymentMethodInput) {

    paymentMethodInput.addEventListener(
        "change",
        updateCashReceivedVisibility
    );

    updateCashReceivedVisibility();
}

const cashReceivedInput =
    document.getElementById("cash-received");

const cashChangeDisplay =
    document.getElementById("cash-change");

function updateCashChange() {

    if (
        !cashReceivedInput ||
        !cashChangeDisplay
    ) {
        return;
    }

    const amountInput =
        document.getElementById("payment-amount");

    if (!amountInput) {
        return;
    }

    const amount =
        Number(amountInput.value) || 0;

    const cashReceived =
        Number(cashReceivedInput.value) || 0;

    const change =
        Math.max(0, cashReceived - amount);

    cashChangeDisplay.textContent =
        `Change: ${formatMoney(change)}`;
}

if (cashReceivedInput) {

    cashReceivedInput.addEventListener(
        "input",
        updateCashChange
    );

    updateCashChange();
}

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
                                payment_method,
                                cash_received:
                                    payment_method === "CASH"
                                        ? Number(
                                            document.getElementById("cash-received")?.value
                                        )
                                        : null
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

// Open Production view

document
    .getElementById("production")
    .addEventListener(
        "click",
        () => {

            ordersView.classList.add("hidden");
            orderDetailView.classList.add("hidden");
            newOrderView.classList.add("hidden");

            productionView.classList.remove("hidden");

            const productionDate =
                document.getElementById("production-date");

            if (productionDate) {

                if (!productionDate.value) {
                    productionDate.value =
                        new Date().toISOString().split("T")[0];
                }

                loadProductionOverview(
                    productionDate.value
                );
            }
        }
    );

document
    .getElementById("production-date")
    .addEventListener(
        "change",
        (event) => {

            loadProductionOverview(
                event.target.value
            );
        }
    );


// Back from Production Item to Production Overview

document
    .getElementById("back-to-production")
    .addEventListener(
        "click",
        () => {

            productionItemView.classList.add("hidden");
            productionView.classList.remove("hidden");

            const productionDate =
                document.getElementById("production-date");

            if (productionDate) {
                loadProductionOverview(
                    productionDate.value
                );
            }
        }
    );


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

async function loadCounterSale() {

    counterSaleCart = [];

    counterSalePaymentMethod.value = "";
    counterSaleCashReceived.value = "";
    counterSaleChange.textContent = "$0.00";
    counterSalePaymentError.textContent = "";
    counterSalePaymentError.classList.add("hidden");

    renderCounterSaleCart();

    try {

        const [
            customersResponse,
            productsResponse,
            customProductsResponse
        ] = await Promise.all([
            fetch("/api/customers"),
            fetch("/api/products"),
            fetch("/api/custom-products")
        ]);

        if (
            !customersResponse.ok ||
            !productsResponse.ok ||
            !customProductsResponse.ok
        ) {
            throw new Error(
                "Failed to load counter sale data."
            );
        }

        const customersData =
            await customersResponse.json();

        const productsData =
            await productsResponse.json();

        const customProductsData =
            await customProductsResponse.json();

        renderCounterSaleCustomers(
            customersData.data
        );

        counterSaleProducts =
            productsData.data;

        renderCounterSaleCategories(
            counterSaleProducts
        );

        renderCounterSaleCustomProducts(
            customProductsData.data
        );

    } catch (error) {

        console.error(
            "Counter Sale load error:",
            error
        );

        counterSaleCustomer.innerHTML = `
            <option value="">
                Unable to load customers
            </option>
        `;

        counterSaleProductList.innerHTML = `
            <p class="error">
                Unable to load products.
            </p>
        `;

        counterSaleCustomProductList.innerHTML = `
            <p class="error">
                Unable to load custom products.
            </p>
        `;
    }
}


function renderCounterSaleCustomers(customers) {

    counterSaleCustomer.innerHTML = `
        <option value="">
            Walk-in / No customer
        </option>
    `;

    customers.forEach(customer => {

        const option =
            document.createElement("option");

        option.value = customer.id;

        option.textContent =
            `${customer.name}${customer.phone ? ` — ${customer.phone}` : ""}`;

        counterSaleCustomer.appendChild(option);
    });
}


function renderCounterSaleCategories(products) {

    const categories = [];

    products.forEach(product => {

        const exists =
            categories.some(
                category =>
                    category.id === product.category_id
            );

        if (!exists) {

            categories.push({
                id: product.category_id,
                name: product.category_name
            });
        }
    });

    counterSaleCategories = categories;

    if (!categories.length) {

        counterSaleCategoryList.innerHTML = "";

        counterSaleProductList.innerHTML = `
            <p>
                No products available.
            </p>
        `;

        return;
    }

    counterSaleCategoryList.innerHTML = "";

    categories.forEach(category => {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "counter-sale-category";

        button.textContent =
            category.name;

        button.addEventListener(
            "click",
            () => {
                selectCounterSaleCategory(
                    category.id
                );
            }
        );

        counterSaleCategoryList.appendChild(
            button
        );
    });

    selectCounterSaleCategory(
        categories[0].id
    );
}


function selectCounterSaleCategory(categoryId) {

    counterSaleSelectedCategoryId =
        categoryId;

    const buttons =
        counterSaleCategoryList.querySelectorAll(
            ".counter-sale-category"
        );

    buttons.forEach(button => {

        button.classList.toggle(
            "selected",
            button.textContent ===
                counterSaleCategories.find(
                    category =>
                        category.id === categoryId
                )?.name
        );
    });

    const products =
        counterSaleProducts.filter(
            product =>
                product.category_id === categoryId
        );

    counterSaleProductList.innerHTML = "";

    products.forEach(product => {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "counter-sale-product";

        button.textContent =
            `${product.name} — $${Number(product.price).toFixed(2)}`;

        button.addEventListener(
            "click",
            () => addCounterSaleProduct(product)
        );

        counterSaleProductList.appendChild(
            button
        );
    });
}


function renderCounterSaleCustomProducts(
    customProducts
) {

    if (!customProducts.length) {

        counterSaleCustomProductList.innerHTML = `
            <p>
                No custom products available.
            </p>
        `;

        return;
    }

    counterSaleCustomProductList.innerHTML = "";

    customProducts.forEach(product => {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "counter-sale-product";

        button.textContent =
            `${product.name} — $${Number(product.price).toFixed(2)}`;

        button.addEventListener(
            "click",
            () => addCounterSaleCustomProduct(product)
        );

        counterSaleCustomProductList.appendChild(button);
    });
}


function addCounterSaleProduct(product) {

    const existingItem =
        counterSaleCart.find(
            item =>
                item.product_id === product.id
        );

    if (existingItem) {

        existingItem.quantity += 1;

    } else {

        counterSaleCart.push({
            product_id: product.id,
            name: product.name,
            unit_price: Number(product.price),
            quantity: 1
        });
    }

    renderCounterSaleCart();
}


function addCounterSaleCustomProduct(product) {

    const existingItem =
        counterSaleCart.find(
            item =>
                item.custom_product_id === product.id
        );

    if (existingItem) {

        existingItem.quantity += 1;

    } else {

        counterSaleCart.push({
            custom_product_id: product.id,
            name: product.name,
            unit_price: Number(product.price),
            quantity: 1
        });
    }

    renderCounterSaleCart();
}


function renderCounterSaleCart() {

    if (!counterSaleCart.length) {

        counterSaleCartElement.innerHTML = `
            <p>
                No items added.
            </p>
        `;

        counterSaleTotal.textContent =
            "$0.00";

        updateCounterSalePayment();

        return;
    }

    let total = 0;

    counterSaleCartElement.innerHTML = "";

    counterSaleCart.forEach((item, index) => {

        const lineTotal =
            item.unit_price * item.quantity;

        total += lineTotal;

        const row =
            document.createElement("div");

        row.className =
            "order-item counter-sale-cart-item";

        row.innerHTML = `
            <div>
                <strong>${item.name}</strong>

                <span>
                    $${item.unit_price.toFixed(2)} each
                </span>
            </div>

            <div class="counter-sale-quantity">

                <button
                    type="button"
                    data-action="decrease"
                >
                    −
                </button>

                <strong>
                    ${item.quantity}
                </strong>

                <button
                    type="button"
                    data-action="increase"
                >
                    +
                </button>

            </div>

            <div>

                <strong>
                    $${lineTotal.toFixed(2)}
                </strong>

                <button
                    type="button"
                    data-action="remove"
                >
                    Remove
                </button>

            </div>
        `;

        row
            .querySelector('[data-action="decrease"]')
            .addEventListener(
                "click",
                () => changeCounterSaleQuantity(
                    index,
                    -1
                )
            );

        row
            .querySelector('[data-action="increase"]')
            .addEventListener(
                "click",
                () => changeCounterSaleQuantity(
                    index,
                    1
                )
            );

        row
            .querySelector('[data-action="remove"]')
            .addEventListener(
                "click",
                () => removeCounterSaleItem(index)
            );

        counterSaleCartElement.appendChild(row);
    });

    counterSaleTotal.textContent =
        `$${total.toFixed(2)}`;

    updateCounterSalePayment();
}


function changeCounterSaleQuantity(
    index,
    amount
) {

    const item =
        counterSaleCart[index];

    if (!item) {
        return;
    }

    item.quantity += amount;

    if (item.quantity <= 0) {

        counterSaleCart.splice(index, 1);
    }

    renderCounterSaleCart();
}


function removeCounterSaleItem(index) {

    counterSaleCart.splice(index, 1);

    renderCounterSaleCart();
}

function updateCounterSalePayment() {

    const total =
        counterSaleCart.reduce(
            (sum, item) =>
                sum +
                item.unit_price * item.quantity,
            0
        );

    const paymentMethod =
        counterSalePaymentMethod.value;

    const cashReceived =
        Number(counterSaleCashReceived.value);

    counterSalePaymentError.classList.add(
        "hidden"
    );

    counterSalePaymentError.textContent = "";

    if (paymentMethod === "CASH") {

        counterSaleCashSection.classList.remove(
            "hidden"
        );

        if (
            counterSaleCashReceived.value !== "" &&
            Number.isFinite(cashReceived)
        ) {

            const change =
                cashReceived - total;

            counterSaleChange.textContent =
                `$${Math.max(change, 0).toFixed(2)}`;

        } else {

            counterSaleChange.textContent =
                "$0.00";
        }

    } else {

        counterSaleCashSection.classList.add(
            "hidden"
        );

        counterSaleChange.textContent =
            "$0.00";
    }

    let canComplete =
        counterSaleCart.length > 0 &&
        total > 0 &&
        paymentMethod !== "";

    if (paymentMethod === "CASH") {

        canComplete =
            canComplete &&
            Number.isFinite(cashReceived) &&
            cashReceived >= total;
    }

    completeCounterSale.disabled =
        !canComplete;
}

counterSalePaymentMethod.addEventListener(
    "change",
    updateCounterSalePayment
);

counterSaleCashReceived.addEventListener(
    "input",
    updateCounterSalePayment
);

completeCounterSale.addEventListener(
    "click",
    async () => {

        if (completeCounterSale.disabled) {
            return;
        }

        completeCounterSale.disabled = true;
        counterSalePaymentError.classList.add("hidden");

        try {
            const response = await fetch(
                "/api/counter-sales",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        customer_id:
                            counterSaleCustomer.value || null,

                        items:
                            counterSaleCart.map(item => ({
                                product_id:
                                    item.product_id ?? null,

                                custom_product_id:
                                    item.custom_product_id ?? null,

                                quantity:
                                    item.quantity
                            })),

                        payment_method:
                            counterSalePaymentMethod.value,

                        cash_received:
                            counterSalePaymentMethod.value === "CASH"
                                ? Number(
                                    counterSaleCashReceived.value
                                )
                                : null
                    })
                }
            );

            const data =
                await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.error ||
                    "Failed to complete counter sale."
                );
            }

            console.log(
                "Counter Sale completed:",
                data
            );

            const change =
                Number(data.change ?? 0);

            const changeMessage =
                change > 0
                    ? `\nChange: $${change.toFixed(2)}`
                    : "";

            alert(
                `Sale completed successfully.\n\n` +
                `Order: ${data.order.order_number}` +
                changeMessage
            );

            counterSaleCart = [];
            counterSaleSelectedCategoryId = null;
            counterSalePaymentError.textContent = "";
            counterSalePaymentError.classList.add("hidden");

            counterSaleView.classList.add("hidden");
            ordersView.classList.remove("hidden");

            loadOrders();

        } catch (error) {

            console.error(
                "Counter Sale completion error:",
                error
            );

            counterSalePaymentError.textContent =
                error.message;

            counterSalePaymentError.classList.remove(
                "hidden"
            );

            completeCounterSale.disabled = false;
        }
    }
);

    // Open Counter Sale view

document
    .getElementById("new-counter-sale")
    .addEventListener(
        "click",
        () => {

            ordersView.classList.add("hidden");
            newOrderView.classList.add("hidden");
            orderDetailView.classList.add("hidden");

            counterSaleView.classList.remove("hidden");

            loadCounterSale();
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


// =========================================================
// Initial Load
// =========================================================

checkAuthentication();