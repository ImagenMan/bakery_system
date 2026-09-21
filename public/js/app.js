// =========================================================
// Bakery System
// Orders UI
// =========================================================

let currentUser = null;
let orderDetailReturnView = "orders";

// --- DOM Elements ---

const loginView = document.getElementById("login-view");
const ordersView = document.getElementById("orders-view");
const pickupListView = document.getElementById("pickup-list-view");
const pickupListButton = document.getElementById("open-pickup-list");
const pickupListBackButton = document.getElementById("pickup-list-back");
const pickupList = document.getElementById("pickup-list");
const orderDetailView = document.getElementById("order-detail-view");
const newOrderView = document.getElementById("new-order-view");
const counterSaleView = document.getElementById("counter-sale-view");
const productionView = document.getElementById("production-view");
const trainingView = document.getElementById("training-view");
const trainingCounterSaleView = document.getElementById(
    "training-counter-sale-view"
);
const trainingPreorderView = document.getElementById(
    "training-preorder-view"
);
const trainingProductionView = document.getElementById(
    "training-production-view"
);
const trainingProductionItemView = document.getElementById(
    "training-production-item-view"
);

const trainingPreorderReviewView = document.getElementById(
    "training-preorder-review-view"
);

const trainingPreorderReviewList = document.getElementById(
    "training-preorder-review-list"
);

const trainingPreorderReviewDetail = document.getElementById(
    "training-preorder-review-detail"
);

const trainingProductionItemTitle = document.getElementById(
    "training-production-item-title"
);

const trainingProductionItemDetail = document.getElementById(
    "training-production-item-detail"
);

const modeIndicator = document.getElementById("mode-indicator");

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

const trainingCounterSaleCartElement = document.getElementById("training-counter-sale-cart");
const trainingCounterSaleTotal = document.getElementById("training-counter-sale-total");

const trainingPreorderCustomer = document.getElementById(
    "training-preorder-customer"
);

const trainingPreorderDelivery = document.getElementById(
    "training-preorder-delivery"
);

const trainingPreorderDeliveryAddressSection =
    document.getElementById(
        "training-preorder-delivery-address-section"
    );

const trainingPreorderDeliveryAddress = document.getElementById(
    "training-preorder-delivery-address"
);

const trainingPreorderCategoryList = document.getElementById(
    "training-preorder-category-list"
);

const trainingPreorderProductList = document.getElementById(
    "training-preorder-product-list"
);

const trainingPreorderCartElement = document.getElementById(
    "training-preorder-cart"
);

const trainingPreorderTotal = document.getElementById(
    "training-preorder-total"
);

const trainingPreorderNotes = document.getElementById(
    "training-preorder-notes"
);

const trainingPreorderError = document.getElementById(
    "training-preorder-error"
);

const trainingPreorderSuccess = document.getElementById(
    "training-preorder-success"
);

const createTrainingPreorder = document.getElementById(
    "create-training-preorder"
);

const clearTrainingPreorder = document.getElementById(
    "clear-training-preorder"
);

const trainingCounterSalePaymentMethod =
    document.getElementById(
        "training-counter-sale-payment-method"
    );

const trainingCounterSaleCashSection =
    document.getElementById(
        "training-counter-sale-cash-section"
    );

const trainingCounterSaleCashReceived =
    document.getElementById(
        "training-counter-sale-cash-received"
    );

const trainingCounterSaleChange =
    document.getElementById(
        "training-counter-sale-change"
    );

const trainingCounterSalePaymentError =
    document.getElementById(
        "training-counter-sale-payment-error"
    );

const completeTrainingCounterSale =
    document.getElementById(
        "complete-training-counter-sale"
    );

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

let trainingCounterSaleCart = [];
let trainingCounterSaleProducts = [];
let trainingCounterSaleCategories = [];
let trainingCounterSaleSelectedCategoryId = null;

let trainingPreorderCart = [];
let trainingPreorderProducts = [];
let trainingPreorderCategories = [];
let trainingPreorderSelectedCategoryId = null;

let trainingProductionDate = null;
let trainingProductionItems = [];
let trainingProductionDemand = [];
let trainingProductionOverview = [];
let trainingSelectedAvailableId = null;

function renderTrainingCounterSaleCart() {

    if (!trainingCounterSaleCart.length) {

        trainingCounterSaleCartElement.innerHTML = `
            <p>
                No items added.
            </p>
        `;

        trainingCounterSaleTotal.textContent =
            "$0.00";

        updateTrainingCounterSalePayment();

        return;
    }

    let total = 0;

    trainingCounterSaleCartElement.innerHTML = "";

    trainingCounterSaleCart.forEach(item => {

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
                    class="training-counter-sale-decrease"
                    data-product-id="${item.product_id || ""}"
                    data-custom-product-id="${item.custom_product_id || ""}"
                >
                    −
                </button>

                <strong>
                    ${item.quantity}
                </strong>

                <button
                    type="button"
                    class="training-counter-sale-increase"
                    data-product-id="${item.product_id || ""}"
                    data-custom-product-id="${item.custom_product_id || ""}"
                >
                    +
                </button>

            </div>

            <div>

                <strong>
                    $${lineTotal.toFixed(2)}
                </strong>

            </div>
        `;

            trainingCounterSaleCartElement.appendChild(
            row
        );

        row
            .querySelector(".training-counter-sale-decrease")
            .addEventListener(
                "click",
                () => {
                    changeTrainingCounterSaleQuantity(
                        item,
                        -1
                    );
                }
            );

        row
            .querySelector(".training-counter-sale-increase")
            .addEventListener(
                "click",
                () => {
                    changeTrainingCounterSaleQuantity(
                        item,
                        1
                    );
                }
            );

    });

    trainingCounterSaleTotal.textContent =
        `$${total.toFixed(2)}`;

    updateTrainingCounterSalePayment();
}

function getTrainingCounterSaleTotal() {

    return trainingCounterSaleCart.reduce(
        (total, item) =>
            total +
            (
                Number(item.unit_price) *
                Number(item.quantity)
            ),
        0
    );
}


function updateTrainingCounterSalePayment() {

    const total =
        getTrainingCounterSaleTotal();

    const paymentMethod =
        trainingCounterSalePaymentMethod.value;

    const cashReceived =
        Number(
            trainingCounterSaleCashReceived.value
        );

    trainingCounterSalePaymentError.textContent = "";

    trainingCounterSalePaymentError.classList.add(
        "hidden"
    );

    if (paymentMethod === "CASH") {

        trainingCounterSaleCashSection.classList.remove(
            "hidden"
        );

        if (
            trainingCounterSaleCashReceived.value !== "" &&
            Number.isFinite(cashReceived)
        ) {

            const change =
                cashReceived - total;

            trainingCounterSaleChange.textContent =
                `$${Math.max(change, 0).toFixed(2)}`;

        } else {

            trainingCounterSaleChange.textContent =
                "$0.00";
        }

    } else {

        trainingCounterSaleCashSection.classList.add(
            "hidden"
        );

        trainingCounterSaleChange.textContent =
            "$0.00";
    }

    let canComplete =
        trainingCounterSaleCart.length > 0 &&
        total > 0 &&
        paymentMethod !== "";

    if (paymentMethod === "CASH") {

        canComplete =
            canComplete &&
            Number.isFinite(cashReceived) &&
            cashReceived >= total;
    }

    completeTrainingCounterSale.disabled =
        !canComplete;
}


function resetTrainingCounterSalePayment() {

    trainingCounterSalePaymentMethod.value = "";

    trainingCounterSaleCashReceived.value = "";

    trainingCounterSaleCashSection.classList.add(
        "hidden"
    );

    trainingCounterSaleChange.textContent =
        "$0.00";

    trainingCounterSalePaymentError.textContent =
        "";

    trainingCounterSalePaymentError.classList.add(
        "hidden"
    );

    completeTrainingCounterSale.disabled =
        true;
}

function changeTrainingCounterSaleQuantity(
    item,
    amount
) {
    item.quantity += amount;

    if (item.quantity <= 0) {
        trainingCounterSaleCart =
            trainingCounterSaleCart.filter(
                cartItem =>
                    cartItem !== item
            );
    }

    renderTrainingCounterSaleCart();
}

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

async function setNormalMode() {
    const response = await fetch("/api/mode", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            mode: "NORMAL"
        })
    });

    const result = await response.json();

    if (!response.ok || !result.success || result.mode !== "NORMAL") {
        throw new Error(
            result.error || "Failed to enter Normal Mode."
        );
    }

    modeIndicator.textContent = "NORMAL MODE";
    modeIndicator.className = "mode-indicator normal";
}


async function setTrainingMode() {
    const response = await fetch("/api/mode", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            mode: "TRAINING"
        })
    });

    const result = await response.json();

    if (!response.ok || !result.success || result.mode !== "TRAINING") {
        throw new Error(
            result.error || "Failed to enter Training Mode."
        );
    }

    modeIndicator.textContent = "TRAINING MODE";
    modeIndicator.className = "mode-indicator training";
}

document
    .getElementById("training-mode")
    .addEventListener(
        "click",
        async () => {
            try {
                await setTrainingMode();
            ordersView.classList.add("hidden");
            orderDetailView.classList.add("hidden");
            newOrderView.classList.add("hidden");
            counterSaleView.classList.add("hidden");
            productionView.classList.add("hidden");

            trainingView.classList.remove("hidden");

            } catch (error) {
                console.error(
                    "Failed to enter Training Mode:",
                    error
                );

                alert(error.message);
            }
        }
    );

document
    .getElementById("training-counter-sale")
    .addEventListener(
        "click",
        () => {
            trainingView.classList.add("hidden");
            trainingProductionItemView.classList.add("hidden");

            trainingCounterSaleView.classList.remove("hidden");

            renderTrainingCounterSaleCart();

            loadTrainingCounterSale();
        }
    );

trainingCounterSalePaymentMethod.addEventListener(
    "change",
    updateTrainingCounterSalePayment
);

trainingCounterSaleCashReceived.addEventListener(
    "input",
    updateTrainingCounterSalePayment
);

completeTrainingCounterSale.addEventListener(
    "click",
    () => {

        if (completeTrainingCounterSale.disabled) {
            return;
        }

        const total =
            getTrainingCounterSaleTotal();

        const paymentMethod =
            trainingCounterSalePaymentMethod.value;

        const cashReceived =
            Number(
                trainingCounterSaleCashReceived.value
            );

        if (
            trainingCounterSaleCart.length === 0 ||
            total <= 0 ||
            paymentMethod === ""
        ) {
            return;
        }

        if (
            paymentMethod === "CASH" &&
            (
                !Number.isFinite(cashReceived) ||
                cashReceived < total
            )
        ) {

            trainingCounterSalePaymentError.textContent =
                "Cash received must be at least the sale total.";

            trainingCounterSalePaymentError.classList.remove(
                "hidden"
            );

            updateTrainingCounterSalePayment();

            return;
        }

        completeTrainingCounterSale.disabled =
            true;

        let message =
            "Training sale completed.\n\n" +
            `Total: $${total.toFixed(2)}\n`;

        if (paymentMethod === "CASH") {

            const change =
                cashReceived - total;

            message +=
                `Payment: Cash\n` +
                `Cash received: $${cashReceived.toFixed(2)}\n` +
                `Change: $${change.toFixed(2)}\n`;

        } else if (paymentMethod === "CARD") {

            message +=
                "Payment: Card\n";

        } else if (paymentMethod === "BANK_TRANSFER") {

            message +=
                "Payment: Bank Transfer\n";

        } else {

            message +=
                "Payment: Other\n";
        }

        message +=
            "\nNo real sale was recorded.";

        alert(message);

        trainingCounterSaleCart = [];

        trainingCounterSaleSelectedCategoryId =
            null;

        document.getElementById(
            "training-counter-sale-customer"
        ).value = "";

        resetTrainingCounterSalePayment();

        renderTrainingCounterSaleCart();
    }
);

document
    .getElementById("training-preorder")
    .addEventListener("click", () => {
        trainingView.classList.add("hidden");
        trainingCounterSaleView.classList.add("hidden");
        trainingProductionView.classList.add("hidden");
        trainingProductionItemView.classList.add("hidden");

        trainingPreorderView.classList.remove("hidden");

        trainingPreorderSuccess.classList.add(
            "hidden"
        );

        loadTrainingPreorder();
    });

trainingPreorderCustomer.addEventListener(
    "change",
    validateTrainingPreorderForm
);


document
    .getElementById("training-preorder-pickup-date")
    .addEventListener(
        "change",
        validateTrainingPreorderForm
    );


document
    .getElementById("training-preorder-pickup-time")
    .addEventListener(
        "change",
        validateTrainingPreorderForm
    );

document.getElementById("training-preorder-review").addEventListener("click", () => {
    trainingView.classList.add("hidden");
    trainingCounterSaleView.classList.add("hidden");
    trainingProductionView.classList.add("hidden");
    trainingProductionItemView.classList.add("hidden");
    trainingPreorderView.classList.add("hidden");
    trainingPreorderReviewView.classList.remove("hidden");

    loadTrainingPreorderReview();
});

async function loadTrainingPreorderReview() {
    trainingPreorderReviewList.innerHTML = "<p>Cargando pedidos...</p>";

    try {
        const response = await fetch("/api/orders");
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.error || "No se pudieron cargar los pedidos.");
        }

        const preorders = result.data.filter(
            order => order.order_type === "PREORDER"
        );

        if (preorders.length === 0) {
            trainingPreorderReviewList.innerHTML =
                "<p>No hay pedidos de capacitación para revisar.</p>";
            return;
        }

        trainingPreorderReviewList.innerHTML = preorders
            .map(order => `
                <div
                    class="order-card"
                    data-training-preorder-id="${order.id}"
                    role="button"
                    tabindex="0"
                >
                    <h3>${escapeHTML(order.order_number)}</h3>

                    <p>
                        Cliente:
                        ${escapeHTML(order.customer_name || "Sin cliente")}
                    </p>

                    <p>
                        Recogida:
                        ${escapeHTML(order.pickup_date || "Sin fecha")}
                        ${escapeHTML(order.pickup_time || "")}
                    </p>

                    <p>
                        Estado:
                        ${escapeHTML(order.status || "")}
                    </p>

                    <p>
                        Total:
                        $${Number(order.total_amount || 0).toFixed(2)}
                    </p>
                </div>
            `)
            .join("");
            trainingPreorderReviewList
                .querySelectorAll("[data-training-preorder-id]")
                .forEach(card => {
                    card.addEventListener("click", () => {
                        const orderId = Number(
                            card.dataset.trainingPreorderId
                        );

                        loadTrainingPreorderReviewDetail(orderId);
                    });
                });
    } catch (error) {
        console.error("Training preorder review error:", error);

        trainingPreorderReviewList.innerHTML = `
            <p class="error">
                ${escapeHTML(error.message)}
            </p>
        `;
    }
}

async function loadTrainingPreorderReviewDetail(orderId) {
    trainingPreorderReviewDetail.innerHTML =
        "<p>Cargando pedido...</p>";

    try {
        const response = await fetch(
            `/api/orders/${orderId}`
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.error || "No se pudo cargar el pedido."
            );
        }

        const order = result.data;

        trainingPreorderReviewDetail.innerHTML = `
            <div class="order-card">
                <h3>
                    ${escapeHTML(order.order_number)}
                </h3>

                <h4>Datos del pedido</h4>

                <div class="training-preorder-edit-details">

                    <label>
                        Cliente
                        <select data-order-customer>
                            <option value="">Seleccionar cliente</option>
                        </select>
                    </label>

                    <label>
                        Fecha de recogida
                        <input
                            type="date"
                            value="${escapeHTML(
                                order.pickup_date || ""
                            )}"
                            data-order-pickup-date
                        >
                    </label>

                    <label>
                        Hora de recogida
                        <input
                            type="time"
                            value="${escapeHTML(
                                order.pickup_time || ""
                            )}"
                            data-order-pickup-time
                        >
                    </label>

                    <label>
                        <input
                            type="checkbox"
                            ${order.delivery ? "checked" : ""}
                            data-order-delivery
                        >
                        Entrega a domicilio
                    </label>

                    <label>
                        Dirección de entrega
                        <textarea
                            data-order-delivery-address
                        >${escapeHTML(
                            order.delivery_address || ""
                        )}</textarea>
                    </label>

                    <label>
                        Notas
                        <textarea
                            data-order-notes
                        >${escapeHTML(
                            order.notes || ""
                        )}</textarea>
                    </label>

                    <button
                        type="button"
                        data-save-order-details
                    >
                        Guardar datos del pedido
                    </button>

                </div>

                <h4>Productos</h4>

                <div class="training-preorder-edit-items">
                    ${order.items
                        .map(item => `
                            <div
                                class="training-preorder-edit-item"
                                data-item-id="${item.id}"
                            >
                                <div>
                                    <strong>
                                        ${escapeHTML(item.product_name)}
                                    </strong>

                                    <p>
                                        $${Number(
                                            item.unit_price || 0
                                        ).toFixed(2)}
                                        c/u
                                    </p>
                                </div>

                                <label>
                                    Cantidad
                                    <input
                                        type="number"
                                        min="${item.quantity_picked_up || 1}"
                                        value="${item.quantity}"
                                        data-quantity-input
                                    >
                                </label>

                                <div>
                                    <button
                                        type="button"
                                        data-save-item
                                    >
                                        Guardar
                                    </button>

                                    <button
                                        type="button"
                                        data-delete-item
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        `)
                        .join("")}
                </div>

                <p>
                    Total:
                    $${Number(order.total_amount || 0).toFixed(2)}
                </p>
            </div>
        `;

                const customerSelect =
                    trainingPreorderReviewDetail.querySelector(
                        "[data-order-customer]"
                    );

                try {
                    const customersResponse = await fetch(
                        "/api/customers"
                    );

                    const customersResult =
                        await customersResponse.json();

                    if (
                        !customersResponse.ok ||
                        !customersResult.success
                    ) {
                        throw new Error(
                            customersResult.error ||
                                "No se pudieron cargar los clientes."
                        );
                    }

                    customerSelect.innerHTML = `
                        <option value="">
                            Seleccionar cliente
                        </option>

                        ${customersResult.data
                            .map(customer => `
                                <option
                                    value="${customer.id}"
                                    ${
                                        Number(customer.id) ===
                                        Number(order.customer_id)
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    ${escapeHTML(customer.name)}
                                </option>
                            `)
                            .join("")}
                    `;
                } catch (error) {
                    console.error(
                        "Training preorder customer loading error:",
                        error
                    );

                    customerSelect.innerHTML = `
                        <option value="">
                            No se pudieron cargar los clientes
                        </option>
                    `;
                }

        const saveOrderDetailsButton =
            trainingPreorderReviewDetail.querySelector(
                "[data-save-order-details]"
            );

        saveOrderDetailsButton.addEventListener(
            "click",
            async () => {
                const pickupDate =
                    trainingPreorderReviewDetail.querySelector(
                        "[data-order-pickup-date]"
                    ).value;

                const pickupTime =
                    trainingPreorderReviewDetail.querySelector(
                        "[data-order-pickup-time]"
                    ).value;

                const delivery =
                    trainingPreorderReviewDetail.querySelector(
                        "[data-order-delivery]"
                    ).checked
                        ? 1
                        : 0;

                const deliveryAddress =
                    trainingPreorderReviewDetail.querySelector(
                        "[data-order-delivery-address]"
                    ).value.trim();

                const notes =
                    trainingPreorderReviewDetail.querySelector(
                        "[data-order-notes]"
                    ).value.trim();

                saveOrderDetailsButton.disabled = true;
                saveOrderDetailsButton.textContent =
                    "Guardando...";

                try {
                    const updateResponse = await fetch(
                        `/api/orders/${orderId}/details`,
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type":
                                    "application/json"
                            },
                            body: JSON.stringify({
                                customer_id:
                                    Number(customerSelect.value) || null,
                                pickup_date:
                                    pickupDate || null,
                                pickup_time:
                                    pickupTime || null,
                                delivery,
                                delivery_address:
                                    deliveryAddress || null,
                                notes: notes || null
                            })
                        }
                    );

                    const updateResult =
                        await updateResponse.json();

                    if (
                        !updateResponse.ok ||
                        !updateResult.success
                    ) {
                        throw new Error(
                            updateResult.error ||
                                "No se pudieron guardar los datos del pedido."
                        );
                    }

                    await loadTrainingPreorderReviewDetail(
                        orderId
                    );

                    await loadTrainingPreorderReview();
                } catch (error) {
                    console.error(
                        "Training preorder details update error:",
                        error
                    );

                    alert(error.message);

                    saveOrderDetailsButton.disabled = false;
                    saveOrderDetailsButton.textContent =
                        "Guardar datos del pedido";
                }
            }
        );

        trainingPreorderReviewDetail
            .querySelectorAll("[data-save-item]")
            .forEach(button => {
                button.addEventListener("click", async () => {
                    const itemContainer =
                        button.closest(
                            "[data-item-id]"
                        );

                    const itemId = Number(
                        itemContainer.dataset.itemId
                    );

                    const quantityInput =
                        itemContainer.querySelector(
                            "[data-quantity-input]"
                        );

                    const quantity = Number(
                        quantityInput.value
                    );

                    if (
                        !Number.isInteger(quantity) ||
                        quantity <= 0
                    ) {
                        alert(
                            "La cantidad debe ser un número entero mayor que cero."
                        );
                        return;
                    }

                    button.disabled = true;
                    button.textContent = "Guardando...";

                    try {
                        const updateResponse = await fetch(
                            `/api/orders/${orderId}/items/${itemId}`,
                            {
                                method: "PUT",
                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },
                                body: JSON.stringify({
                                    quantity
                                })
                            }
                        );

                        const updateResult =
                            await updateResponse.json();

                        if (
                            !updateResponse.ok ||
                            !updateResult.success
                        ) {
                            throw new Error(
                                updateResult.error ||
                                    "No se pudo guardar el cambio."
                            );
                        }

                        await loadTrainingPreorderReviewDetail(
                            orderId
                        );

                        await loadTrainingPreorderReview();
                    } catch (error) {
                        console.error(
                            "Training preorder item update error:",
                            error
                        );

                        alert(error.message);

                        button.disabled = false;
                        button.textContent = "Guardar";
                    }
                });
            });

        trainingPreorderReviewDetail
            .querySelectorAll("[data-delete-item]")
            .forEach(button => {
                button.addEventListener("click", async () => {
                    const itemContainer =
                        button.closest("[data-item-id]");

                    const itemId = Number(
                        itemContainer.dataset.itemId
                    );

                    const productName =
                        itemContainer.querySelector("strong")
                            ?.textContent
                            .trim() || "este producto";

                    const confirmed = confirm(
                        `¿Eliminar ${productName} del pedido?`
                    );

                    if (!confirmed) {
                        return;
                    }

                    button.disabled = true;
                    button.textContent = "Eliminando...";

                    try {
                        const deleteResponse = await fetch(
                            `/api/orders/${orderId}/items/${itemId}`,
                            {
                                method: "DELETE"
                            }
                        );

                        const deleteResult =
                            await deleteResponse.json();

                        if (
                            !deleteResponse.ok ||
                            !deleteResult.success
                        ) {
                            throw new Error(
                                deleteResult.error ||
                                    "No se pudo eliminar el producto."
                            );
                        }

                        await loadTrainingPreorderReviewDetail(
                            orderId
                        );

                        await loadTrainingPreorderReview();
                    } catch (error) {
                        console.error(
                            "Training preorder item delete error:",
                            error
                        );

                        alert(error.message);

                        button.disabled = false;
                        button.textContent = "Eliminar";
                    }
                });
            });
    } catch (error) {
        console.error(
            "Training preorder review detail error:",
            error
        );

        trainingPreorderReviewDetail.innerHTML = `
            <p class="error">
                ${escapeHTML(error.message)}
            </p>
        `;
    }
}

document
    .getElementById("back-to-training-from-preorder-review")
    .addEventListener("click", () => {
        trainingPreorderReviewView.classList.add("hidden");
        trainingView.classList.remove("hidden");
    });


trainingPreorderDelivery.addEventListener(
    "change",
    () => {
        const isDelivery =
            trainingPreorderDelivery.value === "1";

        trainingPreorderDeliveryAddressSection.classList.toggle(
            "hidden",
            !isDelivery
        );

        if (!isDelivery) {
            trainingPreorderDeliveryAddress.value = "";
        }

        validateTrainingPreorderForm();
    }
);


trainingPreorderDeliveryAddress.addEventListener(
    "input",
    validateTrainingPreorderForm
);

createTrainingPreorder.addEventListener(
    "click",
    async () => {
        if (!validateTrainingPreorderForm()) {
            return;
        }

        createTrainingPreorder.disabled = true;

        trainingPreorderError.classList.add(
            "hidden"
        );

        trainingPreorderSuccess.classList.add(
            "hidden"
        );

        const payload = {
            customer_id:
                Number(trainingPreorderCustomer.value),

            pickup_date:
                document.getElementById(
                    "training-preorder-pickup-date"
                ).value,

            pickup_time:
                document.getElementById(
                    "training-preorder-pickup-time"
                ).value,

            delivery:
                Number(trainingPreorderDelivery.value),

            delivery_address:
                trainingPreorderDelivery.value === "1"
                    ? trainingPreorderDeliveryAddress.value.trim()
                    : null,

            notes:
                trainingPreorderNotes.value.trim() ||
                null,

            items:
                trainingPreorderCart.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity
                }))
        };

        try {
            const response =
                await fetch("/api/preorders", {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify(payload)
                });

            const result =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error ||
                    "No se pudo crear el pedido."
                );
            }

            const order =
                result.data;

            trainingPreorderSuccess.textContent =
                `Pedido ${order.order_number} creado correctamente.`;

            trainingPreorderSuccess.classList.remove(
                "hidden"
            );

            trainingPreorderCart = [];

            trainingPreorderSelectedCategoryId =
                null;

            trainingPreorderCustomer.value =
                "";

            document.getElementById(
                "training-preorder-pickup-date"
            ).value = "";

            document.getElementById(
                "training-preorder-pickup-time"
            ).value = "";

            trainingPreorderDelivery.value =
                "0";

            trainingPreorderDeliveryAddress.value =
                "";

            trainingPreorderDeliveryAddressSection.classList.add(
                "hidden"
            );

            trainingPreorderNotes.value =
                "";

            renderTrainingPreorderCart();

            validateTrainingPreorderForm();

        } catch (error) {
            console.error(
                "Training Preorder create error:",
                error
            );

            showTrainingPreorderError(
                error.message ||
                "No se pudo crear el pedido."
            );

            createTrainingPreorder.disabled =
                false;
        }
    }
);

clearTrainingPreorder.addEventListener(
    "click",
    () => {
        trainingPreorderCart = [];

        trainingPreorderSelectedCategoryId =
            null;

        trainingPreorderCustomer.value =
            "";

        document.getElementById(
            "training-preorder-pickup-date"
        ).value = "";

        document.getElementById(
            "training-preorder-pickup-time"
        ).value = "";

        trainingPreorderDelivery.value =
            "0";

        trainingPreorderDeliveryAddress.value =
            "";

        trainingPreorderDeliveryAddressSection.classList.add(
            "hidden"
        );

        trainingPreorderNotes.value =
            "";

        trainingPreorderError.classList.add(
            "hidden"
        );

        trainingPreorderSuccess.classList.add(
            "hidden"
        );

        renderTrainingPreorderCart();
        validateTrainingPreorderForm();
    }
);

document
    .getElementById("training-production")
    .addEventListener(
        "click",
        () => {
            trainingView.classList.add("hidden");

            trainingProductionView.classList.remove("hidden");


            const productionDateInput =
                document.getElementById("training-production-date");

            const now = new Date();

            const today =
                `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

            productionDateInput.value = today;

            loadTrainingProduction(today);
        }
    );

document
    .getElementById("training-production-date")
    .addEventListener(
        "change",
        (event) => {
            loadTrainingProduction(event.target.value);
        }
    );

document
    .getElementById("back-to-training-production")
    .addEventListener(
        "click",
        () => {

            trainingProductionItemView.classList.add(
                "hidden"
            );

            trainingProductionView.classList.remove(
                "hidden"
            );

            renderTrainingProductionOverview();
        }
    );

document
    .getElementById("reset-training-production")
    .addEventListener(
        "click",
        () => {

            renderTrainingProductionOverview();
        }
    );

document
    .getElementById("back-to-training-from-production")
    .addEventListener(
        "click",
        () => {
            trainingProductionView.classList.add("hidden");

            trainingView.classList.remove("hidden");

        }
    );

document
    .getElementById("back-to-training-from-preorder")
    .addEventListener("click", () => {
        trainingPreorderView.classList.add("hidden");
        trainingView.classList.remove("hidden");
    });

document
    .getElementById("back-to-training")
    .addEventListener(
        "click",
        () => {
            trainingCounterSaleCart = [];

            resetTrainingCounterSalePayment();

            trainingCounterSaleView.classList.add("hidden");

            trainingView.classList.remove("hidden");

        }
    );

document
    .getElementById("clear-training-counter-sale")
    .addEventListener(
        "click",
        () => {
            trainingCounterSaleCart = [];

            document.getElementById(
                "training-counter-sale-customer"
            ).value = "";

            resetTrainingCounterSalePayment();

            renderTrainingCounterSaleCart();
        }
    );

function showLogin() {
    loginView.classList.remove("hidden");

    ordersView.classList.add("hidden");
    orderDetailView.classList.add("hidden");
    newOrderView.classList.add("hidden");
    counterSaleView.classList.add("hidden");

    loginUsername.focus();
}

async function showApplication() {
    loginView.classList.add("hidden");

    try {
        await setNormalMode();
    } catch (error) {
        console.error(
            "Failed to establish Normal Mode:",
            error
        );

        loginError.textContent =
            "Unable to establish Normal Mode.";

        loginError.classList.remove("hidden");

        return;
    }

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

        currentUser = result.data;

        await showApplication();

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

            await checkAuthentication();

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
                    ${
                        order.order_type === "COUNTER_SALE"
                            ? `<span class="status-badge">COUNTER SALE</span>`
                            : ""
                    }
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

async function loadPickupList() {

    pickupList.innerHTML = `
        <p class="loading">
            Loading pickup list...
        </p>
    `;

    const today = new Date()
        .toISOString()
        .split("T")[0];

    try {

        const response = await fetch(
            `/api/pickups?date=${encodeURIComponent(today)}`
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
                "Failed to load pickup list."
            );
        }

        if (!Array.isArray(result.data) || result.data.length === 0) {
            pickupList.innerHTML = `
                <p>
                    No pickups for today.
                </p>
            `;
            return;
        }

        const orders = result.data;

        function renderPickupList(filter) {

            let filteredOrders = orders;

            if (filter === "NOT_COMPLETED") {
                filteredOrders = orders.filter(order => {

                    const items = Array.isArray(order.items)
                        ? order.items
                        : [];

                    return items.some(item => {
                        return Number(item.quantity_remaining) > 0;
                    });
                });
            }

            if (filter === "COMPLETED") {
                filteredOrders = orders.filter(order => {

                    const items = Array.isArray(order.items)
                        ? order.items
                        : [];

                    return (
                        items.length > 0 &&
                        items.every(item => {
                            return Number(item.quantity_remaining) === 0;
                        })
                    );
                });
            }

            if (filteredOrders.length === 0) {
                pickupList.innerHTML = `
                    <p>
                        No pickups match this filter.
                    </p>
                `;
                return;
            }

            pickupList.innerHTML = filteredOrders.map(order => {

                const items = Array.isArray(order.items)
                    ? order.items
                    : [];

                return `
                    <div
                        class="pickup-order-card"
                        data-order-id="${Number(order.id)}"
                    >

                        <div class="pickup-order-header">

                            <div>
                                <strong>
                                    ${escapeHTML(
                                        order.pickup_time || "No time"
                                    )}
                                </strong>

                                <span>
                                    ${escapeHTML(
                                        order.customer_name || "Walk-in"
                                    )}
                                </span>
                            </div>

                            <strong>
                                ${escapeHTML(order.order_number)}
                            </strong>

                        </div>

                        <div class="pickup-order-items">

                            ${
                                items.length === 0
                                    ? `
                                        <p>
                                            No items.
                                        </p>
                                    `
                                    : items.map(item => `
                                        <div class="pickup-order-item">

                                            <strong>
                                                ${Number(item.quantity)}
                                            </strong>

                                            <span>
                                                ${escapeHTML(
                                                    item.product_name ||
                                                    "Unknown item"
                                                )}
                                            </span>

                                        </div>
                                    `).join("")
                            }

                        </div>

                    </div>
                `;

            }).join("");

            document
                .querySelectorAll(".pickup-order-card")
                .forEach(card => {

                    card.addEventListener(
                        "click",
                        () => {

                            const orderId =
                                Number(card.dataset.orderId);

                            if (
                                !Number.isInteger(orderId) ||
                                orderId <= 0
                            ) {
                                return;
                            }

                            orderDetailReturnView = "pickup";

                            pickupListView.classList.add("hidden");

                            loadOrderDetail(orderId);
                        }
                    );
                });
        }

        renderPickupList("ALL");

        document
            .querySelectorAll(".pickup-filter")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(".pickup-filter")
                            .forEach(filterButton => {
                                filterButton.classList.remove("active");
                            });

                        button.classList.add("active");

                        renderPickupList(
                            button.dataset.pickupFilter
                        );
                    }
                );
            });

    } catch (error) {

        console.error(
            "loadPickupList error:",
            error
        );

        pickupList.innerHTML = `
            <p class="error">
                ${escapeHTML(error.message)}
            </p>
        `;
    }
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
        // Load production availability
        // -------------------------------------------------

        let availableQuantity = 0;
        let availableEntries = [];

        if (
            plan &&
            Number.isInteger(Number(plan.id)) &&
            Number(plan.id) > 0
        ) {

            const availableResponse =
                await fetch(
                    `/api/production/plans/${Number(plan.id)}/available`
                );

            if (!availableResponse.ok) {
                throw new Error(
                    `Server returned ${availableResponse.status}.`
                );
            }

            const availableResult =
                await availableResponse.json();

            if (!availableResult.success) {
                throw new Error(
                    availableResult.error ||
                    "Failed to load production availability."
                );
            }

            availableQuantity =
                Number(availableResult.data.total_available) || 0;

            availableEntries =
                Array.isArray(availableResult.data.entries)
                    ? availableResult.data.entries
                    : [];
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
                    Number(totals.total_produced) || 0,

                available_quantity:
                    availableQuantity,

                available_entries:
                    availableEntries
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

    const available =
    Number(item.available_quantity) || 0;

    const availableEntries =
        Array.isArray(item.available_entries)
            ? item.available_entries
            : [];

    const toMake =
        Math.max(demand - planned, 0);

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
                <strong>Available</strong>
                <span>${available}</span>
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

        <div class="production-actions">

            <label for="available-quantity">
                Quantity available
            </label>

            <input
                type="number"
                id="available-quantity"
                min="1"
                step="1"
                placeholder="e.g. 20"
            >

            <button
                type="button"
                id="add-available"
            >
                + Available
            </button>

        </div>

        ${
            currentUser &&
            currentUser.role === "ADMIN"
                ? `
                    <div class="production-eod">
                        <h3>End of Day</h3>

                        <p>
                            Remaining fresh inventory will be written off.
                            Frozen inventory is not affected.
                        </p>

                        <button
                            type="button"
                            id="end-production-day"
                        >
                            End Production Day
                        </button>
                    </div>
                `
                : ""
        }

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

        document
        .getElementById("add-available")
        .addEventListener(
            "click",
            () => {
                recordProductionAvailable(
                    plan,
                    productionDate,
                    productionItemId
                );
            }
        );
    const endOfDayButton =
        document.getElementById("end-production-day");

    if (endOfDayButton) {
        endOfDayButton.addEventListener(
            "click",
            () => {
                endProductionDay(
                    plan,
                    productionDate,
                    productionItemId
                );
            }
        );
    }

}

async function endProductionDay(
    plan,
    productionDate,
    productionItemId
) {

    if (!plan || !Number(plan.id)) {
        alert("Save a production plan first.");
        return;
    }

    const confirmed =
        window.confirm(
            "End this production day?\n\n" +
            "Any remaining fresh inventory will be written off as waste.\n\n" +
            "Frozen inventory will not be affected.\n\n" +
            "This action cannot be undone."
        );

    if (!confirmed) {
        return;
    }

    const button =
        document.getElementById("end-production-day");

    if (!button) {
        return;
    }

    button.disabled = true;
    button.textContent = "Ending Day...";

    try {

        const response =
            await fetch(
                `/api/production/plans/${Number(plan.id)}/end-of-day`,
                {
                    method: "POST"
                }
            );

        const result =
            await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.error ||
                "Failed to close production day."
            );
        }

        const wasteCount =
            Number(result.data?.waste_count) || 0;

        alert(
            wasteCount > 0
                ? `Production day ended. ${wasteCount} fresh inventory waste transaction${wasteCount === 1 ? "" : "s"} recorded.`
                : "Production day ended. No remaining fresh inventory was found."
        );

        await loadProductionItem(
            productionItemId,
            productionDate
        );

    } catch (error) {

        console.error(
            "endProductionDay error:",
            error
        );

        alert(
            error.message ||
            "Failed to close production day."
        );

        button.disabled = false;
        button.textContent = "End Production Day";
    }
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

async function recordProductionAvailable(
    plan,
    productionDate,
    productionItemId
) {

    if (!plan || !Number(plan.id)) {
        alert("Save a production plan first.");
        return;
    }

    const button =
        document.getElementById("add-available");

    if (!button) {
        return;
    }

    const input =
        document.getElementById("available-quantity");

    if (!input) {
        return;
    }

    const availableQuantity =
        Number(input.value);

    if (
        !Number.isInteger(availableQuantity) ||
        availableQuantity <= 0
    ) {
        alert(
            "Quantity available must be a positive whole number."
        );

        input.focus();

        return;
    }

    button.disabled = true;
    button.textContent = "Recording...";

    try {

        const response =
            await fetch(
                `/api/production/plans/${Number(plan.id)}/available`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        available_quantity:
                            availableQuantity
                    })
                }
            );

        const result =
            await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.error ||
                "Failed to record availability."
            );
        }

        await loadProductionItem(
            productionItemId,
            productionDate
        );

    } catch (error) {

        console.error(
            "recordProductionAvailable error:",
            error
        );

        alert(
            error.message ||
            "Failed to record availability."
        );

        button.disabled = false;
        button.textContent = "+ Available";
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
            Math.max(demand - planned, 0);

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

    const isCompletedCounterSale =
        order.order_type === "COUNTER_SALE" &&
        order.status === "COMPLETED";

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


                        ${
                isCompletedCounterSale
                    ? `
                        <div class="status-control">

                            <strong>Order Status:</strong>

                            <span>
                                ${escapeHTML(order.status)}
                            </span>

                        </div>
                    `
                    : `
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
                    `
            }


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

                ${
                    isCompletedCounterSale
                        ? ""
                        : `
                            <button
                                type="button"
                                id="add-item-button"
                            >
                                + Add Item
                            </button>
                        `
                }

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
                        : items
                            .map(item =>
                                renderOrderItem(
                                    item,
                                    isCompletedCounterSale
                                )
                            )
                            .join("")
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

function renderOrderItem(
    item,
    isCompletedCounterSale = false
) {
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

                ${
                    isCompletedCounterSale
                        ? `
                            <span>
                                ${escapeHTML(item.production_status)}
                            </span>
                        `
                        : `
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
                        `
                }

                <span class="pickup-progress">
                    Picked up:
                    ${pickedUp}/${quantity}
                </span>

            </div>


            <div class="item-pickup">

                ${
    isCompletedCounterSale
        ? `
            ${
                remaining > 0
                    ? `
                        <span>
                            ${remaining}
                            remaining
                        </span>
                    `
                    : `
                        <span class="pickup-complete">
                            ✓ Fully Picked Up
                        </span>
                    `
            }
        `
        : remaining > 0
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

// Back from Production to Orders

document
    .getElementById("back-to-orders-from-production")
    .addEventListener(
        "click",
        () => {

            productionView.classList.add("hidden");

            ordersView.classList.remove("hidden");

            loadOrders();
        }
    );

// Refresh Orders

document
    .getElementById("refresh-orders")
    .addEventListener(
        "click",
        () => {
            loadOrders();
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

async function loadTrainingProduction(date) {

    const content =
        trainingProductionView.querySelector(
            ".training-production-content"
        );

    content.innerHTML = `
        <p class="loading">
            Loading training production...
        </p>
    `;

    trainingProductionDate = date;

    try {

        const [
            itemsResponse,
            overviewResponse
        ] = await Promise.all([
            fetch("/api/production/items"),
            fetch(
                `/api/production/overview?date=${encodeURIComponent(date)}`,
                {
                    cache: "no-store"
                }
            )
        ]);

        if (!itemsResponse.ok) {
            throw new Error(
                "Failed to load training production items."
            );
        }

        if (!overviewResponse.ok) {
            throw new Error(
                "Failed to load training production overview."
            );
        }

        const itemsResult =
            await itemsResponse.json();

        const overviewResult =
            await overviewResponse.json();

        trainingProductionItems =
            Array.isArray(itemsResult.data)
                ? itemsResult.data
                : [];

        /*
        * Training demand comes from the Training DB preorder data
        * returned by the production overview.
        */
        trainingProductionDemand =
            Array.isArray(overviewResult.data)
                ? overviewResult.data
                    .filter(item =>
                        Number(item.demand_quantity) > 0 ||
                        Number(item.planned_quantity) > 0
                    )
                    .map(item => ({
                        production_item_id: item.production_item_id,
                        demand_quantity: Number(item.demand_quantity) || 0
                    }))
                : [];

        /*
         * The production API is mode-aware.
         * Because this request is made in TRAINING MODE,
         * the data comes from training.db.
         */
        trainingProductionOverview =
            Array.isArray(overviewResult.data)
                ? overviewResult.data
                : [];

        renderTrainingProductionOverview();

    } catch (error) {

        console.error(
            "loadTrainingProduction error:",
            error
        );

        content.innerHTML = `
            <p class="error">
                ${escapeHTML(error.message)}
            </p>
        `;
    }
}


function renderTrainingProductionOverview() {

    const content =
        trainingProductionView.querySelector(
            ".training-production-content"
        );

    if (!trainingProductionDemand.length) {

        content.innerHTML = `
            <p>
                No production demand for this date.
            </p>
        `;

        return;
    }

    content.innerHTML =
        trainingProductionDemand.map(
            demandItem => {

                const productionItem =
                    trainingProductionItems.find(
                        item =>
                            Number(item.id) ===
                            Number(
                                demandItem.production_item_id
                            )
                    );

                if (!productionItem) {
                    return "";
                }

                const overviewItem =
                    trainingProductionOverview.find(
                        item =>
                            Number(
                                item.production_item_id
                            ) ===
                            Number(
                                productionItem.id
                            )
                    );

                const committed =
                    Number(
                        demandItem.demand_quantity
                    ) || 0;

                const batchQuantity =
                    Number(
                        productionItem.base_batch_quantity
                    ) || 0;

                const planned =
                    overviewItem
                        ? Number(
                            overviewItem.planned_quantity
                        ) || 0
                        : 0;

                const made =
                    overviewItem
                        ? Number(
                            overviewItem.made_quantity
                        ) || 0
                        : 0;

                const toMake =
                    Math.max(
                        committed - planned,
                        0
                    );

                return `
                    <button
                        type="button"
                        class="production-item training-production-item"
                        data-production-item-id="${productionItem.id}"
                    >

                        <strong>
                            ${escapeHTML(
                                productionItem.product_name
                            )}
                        </strong>

                        <span>
                            ${committed} committed
                        </span>

                        <span>
                            ${planned} planned
                        </span>

                        <span>
                            ${made} made
                        </span>

                        <span>
                            ${toMake} to make
                        </span>

                    </button>
                `;
            }
        ).join("");

    content
        .querySelectorAll(
            ".training-production-item"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const productionItemId =
                        Number(
                            button.dataset
                                .productionItemId
                        );

                    if (
                        !Number.isInteger(
                            productionItemId
                        ) ||
                        productionItemId <= 0
                    ) {
                        return;
                    }

                    loadTrainingProductionItem(
                        productionItemId
                    );
                }
            );
        });
}


async function loadTrainingProductionItem(
    productionItemId
) {

    const productionItem =
        trainingProductionItems.find(
            item =>
                Number(item.id) ===
                Number(productionItemId)
        );

    const demandItem =
        trainingProductionDemand.find(
            item =>
                Number(item.production_item_id) ===
                Number(productionItemId)
        );

    if (!productionItem || !demandItem) {
        return;
    }

    trainingProductionView.classList.add("hidden");

    trainingProductionItemView.classList.remove("hidden");

    trainingProductionItemTitle.textContent =
        productionItem.product_name;

    const committed =
        Number(demandItem.demand_quantity) || 0;

    const overviewItem =
        trainingProductionOverview.find(
            item =>
                Number(item.production_item_id) ===
                Number(productionItemId)
        );

    const planId =
        overviewItem &&
        overviewItem.production_plan_id
            ? Number(overviewItem.production_plan_id)
            : null;

    const planned =
        overviewItem
            ? Number(
                overviewItem.planned_quantity
            ) || 0
            : 0;

    const batchQuantity =
        Number(
            productionItem.base_batch_quantity
        ) || 0;

    const made =
        overviewItem
            ? Number(
                overviewItem.made_quantity
            ) || 0
            : 0;

    const available =
        overviewItem
            ? Number(
                overviewItem.available_quantity
            ) || 0
            : 0;

    let availableEntries = [];

        if (planId) {

            const availableResponse =
                await fetch(
                    `/api/production/plans/${planId}/available`
                );

            if (!availableResponse.ok) {
                throw new Error(
                    `Server returned ${availableResponse.status}.`
                );
            }

            const availableResult =
                await availableResponse.json();

            if (!availableResult.success) {
                throw new Error(
                    availableResult.error ||
                    "Failed to load production availability."
                );
            }

            availableEntries =
                Array.isArray(
                    availableResult.data.entries
                )
                    ? availableResult.data.entries
                    : [];
        }

    const toMake =
        Math.max(
            committed - planned,
            0
        );

    trainingProductionItemDetail.innerHTML = `
        <div class="production-summary">

            <div>
                <strong>Committed</strong>
                <span>${committed}</span>
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
                <strong>Available</strong>
                <span>${available}</span>
            </div>

            <div>
                <strong>To Make</strong>
                <span>${toMake}</span>
            </div>

        </div>

        <div class="training-production-plan">

            <label for="training-production-planned-quantity">
                Planned quantity
            </label>

            <input
                type="number"
                id="training-production-planned-quantity"
                min="0"
                step="1"
                value="${planned}"
            >

            <button
                type="button"
                id="save-training-production-plan"
            >
                Save Plan
            </button>

        </div>

        <div class="training-production-made">

            <label for="training-production-made-quantity">
                Made quantity
            </label>

            <input
                type="number"
                id="training-production-made-quantity"
                min="0"
                step="1"
                value="${made}"
            >

            <button
                type="button"
                id="save-training-production-made"
            >
                Save Made
            </button>

        </div>

        <div class="training-production-available">

            <label for="training-production-available-quantity">
                Available quantity
            </label>

            <input
                type="number"
                id="training-production-available-quantity"
                min="0"
                step="1"
                value="${available}"
            >

            <button
                type="button"
                id="save-training-production-available"
            >
                Save Available
            </button>

        </div>

        <div class="training-production-available">

            <label>
                Available lots
            </label>

            <div>
                ${
                    availableEntries.length > 0
                        ? availableEntries
                            .map(
                                (entry) => `
                                    <button
                                        type="button"
                                        class="training-production-available-lot"
                                        data-available-id="${entry.id}"
                                    >
                                        <div>
                                            Lot #${entry.id}
                                            — ${Number(entry.available_quantity) || 0}
                                            <span class="training-production-available-lot-status"></span>
                                        </div>

                                        <div class="training-production-available-lot-balance">
                                            Select lot to view inventory
                                        </div>
                                    </button>
                                `
                            )
                            .join("")
                        : "No available lots."
                }
            </div>

        </div>

        <div class="training-production-waste">

            <label>
                Waste / Loss
            </label>

            <div class="training-production-waste-content">
                Select an available lot above to record waste or loss.
            </div>

            <div class="training-production-waste-form"
                 hidden
            >

                <label>
                    State
                </label>

                <select
                    class="training-production-waste-state"
                >
                    <option value="FRESH">
                        Fresh
                    </option>

                    <option value="FROZEN">
                        Frozen
                    </option>
                </select>

                <label>
                    Quantity
                </label>

                <input
                    type="number"
                    class="training-production-waste-quantity"
                    min="1"
                    step="1"
                    value="1"
                />

                <label>
                    Reason
                </label>

                <select
                    class="training-production-waste-reason"
                >
                    <option value="UNSOLD">
                        Unsold
                    </option>

                    <option value="DAMAGED">
                        Damaged
                    </option>

                    <option value="EXPIRED">
                        Expired
                    </option>

                    <option value="OTHER">
                        Other
                    </option>
                </select>

                <label>
                    Notes
                </label>

                <textarea
                    class="training-production-waste-notes"
                    rows="3"
                ></textarea>

                <button
                    type="button"
                    class="training-production-waste-save"
                >
                    Save Waste / Loss
                </button>

            </div>

        </div>

        ${
            currentUser &&
            currentUser.role === "ADMIN"
                ? `
                    <div class="training-production-eod">

                        <label>
                            End of Day
                        </label>

                        <p>
                            Remaining fresh inventory will be written off.
                            Frozen inventory is not affected.
                        </p>

                        <button
                            type="button"
                            class="training-production-eod-button"
                        >
                            End Production Day
                        </button>

                    </div>
                `
                : ""
        }
    `;

    const plannedQuantityInput =
        document.getElementById(
            "training-production-planned-quantity"
        );

    const savePlanButton =
        document.getElementById(
            "save-training-production-plan"
        );

    const madeQuantityInput =
        document.getElementById(
            "training-production-made-quantity"
        );

    const saveMadeButton =
        document.getElementById(
            "save-training-production-made"
        );

    const availableQuantityInput =
        document.getElementById(
            "training-production-available-quantity"
        );

    const saveAvailableButton =
        document.getElementById(
            "save-training-production-available"
        );

    const trainingProductionWaste =
        trainingProductionItemDetail.querySelector(
            ".training-production-waste"
        );

    const saveWasteButton =
        trainingProductionWaste
            ? trainingProductionWaste.querySelector(
                ".training-production-waste-save"
            )
            : null;

    if (saveWasteButton) {

        saveWasteButton.addEventListener(
            "click",
            async () => {

                if (!trainingSelectedAvailableId) {
                    alert(
                        "Select an available lot first."
                    );
                    return;
                }

                const state =
                    trainingProductionWaste.querySelector(
                        ".training-production-waste-state"
                    ).value;

                const quantity =
                    Number(
                        trainingProductionWaste.querySelector(
                            ".training-production-waste-quantity"
                        ).value
                    );

                const reason =
                    trainingProductionWaste.querySelector(
                        ".training-production-waste-reason"
                    ).value;

                const notes =
                    trainingProductionWaste.querySelector(
                        ".training-production-waste-notes"
                    ).value.trim();

                if (!Number.isInteger(quantity) || quantity <= 0) {
                    alert(
                        "Enter a valid positive quantity."
                    );
                    return;
                }

                saveWasteButton.disabled = true;

                try {

                    const response =
                        await fetch(
                            `/api/production/available/${trainingSelectedAvailableId}/waste`,
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },
                                body: JSON.stringify({
                                    source_production_available_id:
                                        trainingSelectedAvailableId,
                                    quantity,
                                    state,
                                    reason,
                                    notes:
                                        notes || null
                                })
                            }
                        );

                    const result =
                        await response.json();

                    if (!response.ok || !result.success) {
                        throw new Error(
                            result.error ||
                            "Failed to save waste/loss."
                        );
                    }

                    const balanceResponse =
                       await fetch(
                           `/api/production/available/${trainingSelectedAvailableId}/inventory`
                       );

                   if (!balanceResponse.ok) {
                       throw new Error(
                           `Server returned ${balanceResponse.status}.`
                       );
                   }

                   const balanceResult =
                       await balanceResponse.json();

                   if (!balanceResult.success) {
                       throw new Error(
                           balanceResult.error ||
                           "Waste was saved, but inventory could not be refreshed."
                       );
                   }

                   const fresh =
                       Number(balanceResult.data.fresh) || 0;

                   const frozen =
                       Number(balanceResult.data.frozen) || 0;

                   const selectedLotButton =
                       trainingProductionItemDetail.querySelector(
                           `.training-production-available-lot[data-available-id="${trainingSelectedAvailableId}"]`
                       );

                   if (selectedLotButton) {

                       const balance =
                           selectedLotButton.querySelector(
                               ".training-production-available-lot-balance"
                           );

                       if (balance) {
                           balance.textContent =
                               `Fresh: ${fresh} — Frozen: ${frozen}`;
                       }
                   }

                   const wasteContent =
                       trainingProductionWaste.querySelector(
                           ".training-production-waste-content"
                       );

                   if (wasteContent) {
                       wasteContent.innerHTML = `
                           <div>
                               Selected Lot #${trainingSelectedAvailableId}
                           </div>

                           <div>
                               Fresh available: ${fresh}
                           </div>

                           <div>
                               Frozen available: ${frozen}
                           </div>
                       `;
                   }

                   alert(
                       "Waste / Loss saved."
                   );

                } catch (error) {

                    console.error(
                        "Failed to save waste/loss:",
                        error
                    );

                    alert(
                        error.message ||
                        "Failed to save waste/loss."
                    );

                } finally {

                    saveWasteButton.disabled = false;
                }
            }
        );
    }

    const availableLotButtons =
        trainingProductionItemDetail.querySelectorAll(
            ".training-production-available-lot"
        );

    availableLotButtons.forEach(
        (button) => {
            button.addEventListener(
                "click",
                async () => {

                    trainingSelectedAvailableId =
                        Number(
                            button.dataset.availableId
                        );

                    availableLotButtons.forEach(
                        (lotButton) => {

                            lotButton.classList.remove(
                                "selected"
                            );

                            const status =
                                lotButton.querySelector(
                                    ".training-production-available-lot-status"
                                );

                            if (status) {
                                status.textContent = "";
                            }
                        }
                    );

                    button.classList.add(
                        "selected"
                    );

                    const status =
                        button.querySelector(
                            ".training-production-available-lot-status"
                        );

                    if (status) {
                        status.textContent =
                            " — Selected";
                    }

                    const balance =
                        button.querySelector(
                            ".training-production-available-lot-balance"
                        );

                    const wasteForm =
                        trainingProductionWaste
                            ? trainingProductionWaste.querySelector(
                                ".training-production-waste-form"
                            )
                            : null;

                    if (wasteForm) {
                        wasteForm.hidden = false;
                    }

                    if (balance) {
                        balance.textContent =
                            "Loading inventory...";
                    }

                    try {

                        const response =
                            await fetch(
                                `/api/production/available/${trainingSelectedAvailableId}/inventory`
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
                                "Failed to load inventory."
                            );
                        }

                        if (balance) {
                            balance.textContent =
                                `Fresh: ${Number(result.data.fresh) || 0} — Frozen: ${Number(result.data.frozen) || 0}`;
                        }

                        if (trainingProductionWaste) {

                            const fresh =
                                Number(result.data.fresh) || 0;

                            const frozen =
                                Number(result.data.frozen) || 0;

                            const wasteContent =
                                trainingProductionWaste.querySelector(
                                    ".training-production-waste-content"
                                );

                            if (wasteContent) {
                                wasteContent.innerHTML = `
                                    <div>
                                        Selected Lot #${trainingSelectedAvailableId}
                                    </div>

                                    <div>
                                        Fresh available: ${fresh}
                                    </div>

                                    <div>
                                        Frozen available: ${frozen}
                                    </div>
                                `;
                            }
                        }

                    } catch (error) {

                        console.error(
                            "Failed to load available lot inventory:",
                            error
                        );

                        if (balance) {
                            balance.textContent =
                                "Unable to load inventory.";
                        }
                    }
                }
            );
        }
    );

    savePlanButton.addEventListener(
        "click",
        async () => {

            const plannedQuantity =
                Number(
                    plannedQuantityInput.value
                );

            if (
                !Number.isInteger(
                    plannedQuantity
                ) ||
                plannedQuantity < 0
            ) {
                return;
            }

            try {

                savePlanButton.disabled = true;

                let response;

                if (planId) {

                    response =
                        await fetch(
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

                } else {

                    response =
                        await fetch(
                            "/api/production/plans",
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },
                                body: JSON.stringify({
                                    production_item_id:
                                        productionItem.id,
                                    production_date:
                                        trainingProductionDate,
                                    planned_quantity:
                                        plannedQuantity
                                })
                            }
                        );
                }

                const result =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.error ||
                        "Failed to save training production plan."
                    );
                }

                await loadTrainingProduction(
                    trainingProductionDate
                );

                loadTrainingProductionItem(
                    productionItem.id
                );

            } catch (error) {

                console.error(
                    "Training production plan save error:",
                    error
                );

                alert(error.message);

            } finally {

                savePlanButton.disabled = false;
            }
        }
    );


    saveMadeButton.addEventListener(
        "click",
        async () => {

            const newMadeQuantity =
                Number(
                    madeQuantityInput.value
                );

            if (
                !Number.isInteger(
                    newMadeQuantity
                ) ||
                newMadeQuantity < 0
            ) {
                return;
            }

            if (!planId) {

                alert(
                    "Save a production plan before recording production."
                );

                return;
            }

            const difference =
                newMadeQuantity - made;

            if (difference < 0) {

                alert(
                    "Made quantity cannot be reduced because production history is recorded as completed output."
                );

                return;
            }

            if (difference === 0) {
                return;
            }

            try {

                saveMadeButton.disabled = true;

                const response =
                    await fetch(
                        `/api/production/plans/${planId}/outputs`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/json"
                            },
                            body: JSON.stringify({
                                produced_quantity:
                                    difference
                            })
                        }
                    );

                const result =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.error ||
                        "Failed to save training production."
                    );
                }

                await loadTrainingProduction(
                    trainingProductionDate
                );

                loadTrainingProductionItem(
                    productionItem.id
                );

            } catch (error) {

                console.error(
                    "Training production made save error:",
                    error
                );

                alert(error.message);

            } finally {

                saveMadeButton.disabled = false;
            }
        }
    );
    saveAvailableButton.addEventListener(
        "click",
        async () => {

            const newAvailableQuantity =
                Number(
                    availableQuantityInput.value
                );

            if (
                !Number.isInteger(
                    newAvailableQuantity
                ) ||
                newAvailableQuantity < 0
            ) {
                return;
            }

            if (!planId) {

                alert(
                    "Save a production plan before recording availability."
                );

                return;
            }

            const difference =
                newAvailableQuantity - available;

            if (difference < 0) {

                alert(
                    "Available quantity cannot be reduced because production availability is recorded as completed handoff."
                );

                return;
            }

            if (difference === 0) {
                return;
            }

            try {

                saveAvailableButton.disabled = true;

                const response =
                    await fetch(
                        `/api/production/plans/${planId}/available`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/json"
                            },
                            body: JSON.stringify({
                                available_quantity:
                                    difference
                            })
                        }
                    );

                const result =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.error ||
                        "Failed to save training production availability."
                    );
                }

                await loadTrainingProduction(
                    trainingProductionDate
                );

                loadTrainingProductionItem(
                    productionItem.id
                );

            } catch (error) {

                console.error(
                    "Training production available save error:",
                    error
                );

                alert(error.message);

            } finally {

                saveAvailableButton.disabled = false;
            }
        }
    );

        const trainingEndOfDayButton =
            trainingProductionItemDetail.querySelector(
                ".training-production-eod-button"
            );

        if (trainingEndOfDayButton) {

            trainingEndOfDayButton.addEventListener(
                "click",
                async () => {

                    if (!planId) {

                        alert(
                            "Save a production plan first."
                        );

                        return;
                    }

                    const confirmed =
                        window.confirm(
                            "End this production day?\n\n" +
                            "Any remaining fresh inventory will be written off as waste.\n\n" +
                            "Frozen inventory will not be affected.\n\n" +
                            "This action cannot be undone."
                        );

                    if (!confirmed) {
                        return;
                    }

                    trainingEndOfDayButton.disabled = true;

                    trainingEndOfDayButton.textContent =
                        "Ending Day...";

                    try {

                        const response =
                            await fetch(
                                `/api/production/plans/${Number(planId)}/end-of-day`,
                                {
                                    method: "POST"
                                }
                            );

                        const result =
                            await response.json();

                        if (
                            !response.ok ||
                            !result.success
                        ) {
                            throw new Error(
                                result.error ||
                                "Failed to close production day."
                            );
                        }

                        const wasteCount =
                            Number(
                                result.data?.waste_count
                            ) || 0;

                        alert(
                            wasteCount > 0
                                ? `Production day ended. ${wasteCount} fresh inventory waste transaction${wasteCount === 1 ? "" : "s"} recorded.`
                                : "Production day ended. No remaining fresh inventory was found."
                        );

                        await loadTrainingProduction(
                            trainingProductionDate
                        );

                        loadTrainingProductionItem(
                            productionItem.id
                        );

                    } catch (error) {

                        console.error(
                            "Training production EOD error:",
                            error
                        );

                        alert(
                            error.message ||
                            "Failed to close production day."
                        );

                        trainingEndOfDayButton.disabled =
                            false;

                        trainingEndOfDayButton.textContent =
                            "End Production Day";
                    }
                }
            );
        }
}

async function loadTrainingCounterSale() {

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
                "Failed to load training counter sale data."
            );
        }

        const customersData =
            await customersResponse.json();

        const productsData =
            await productsResponse.json();

        const customProductsData =
            await customProductsResponse.json();

        renderTrainingCounterSaleCustomers(
            customersData.data
        );

        trainingCounterSaleProducts =
            productsData.data;

        renderTrainingCounterSaleCategories(
            trainingCounterSaleProducts
        );

        renderTrainingCounterSaleCustomProducts(
            customProductsData.data
        );

    } catch (error) {

        console.error(
            "Training Counter Sale load error:",
            error
        );

        document.getElementById(
            "training-counter-sale-category-list"
        ).innerHTML = "";

        document.getElementById(
            "training-counter-sale-product-list"
        ).innerHTML = `
            <p class="error">
                Unable to load products.
            </p>
        `;

        document.getElementById(
            "training-counter-sale-custom-product-list"
        ).innerHTML = `
            <p class="error">
                Unable to load custom products.
            </p>
        `;
    }
}

async function loadTrainingPreorder() {

    try {

        const [
            customersResponse,
            productsResponse
        ] = await Promise.all([
            fetch("/api/customers"),
            fetch("/api/products")
        ]);

        if (
            !customersResponse.ok ||
            !productsResponse.ok
        ) {
            throw new Error(
                "Failed to load training preorder data."
            );
        }

        const customersData =
            await customersResponse.json();

        const productsData =
            await productsResponse.json();

        renderTrainingPreorderCustomers(
            customersData.data
        );

        trainingPreorderProducts =
            productsData.data;

        renderTrainingPreorderCategories(
            trainingPreorderProducts
        );

    } catch (error) {

        console.error(
            "Training Preorder load error:",
            error
        );

        trainingPreorderCategoryList.innerHTML = "";

        trainingPreorderProductList.innerHTML = `
            <p class="error">
                No se pudieron cargar los productos.
            </p>
        `;
    }
}


function renderTrainingPreorderCustomers(
    customers
) {

    trainingPreorderCustomer.innerHTML = `
        <option value="">
            Selecciona un cliente
        </option>
    `;

    customers.forEach(customer => {

        const option =
            document.createElement("option");

        option.value =
            customer.id;

        option.textContent =
            `${customer.name}${customer.phone ? ` — ${customer.phone}` : ""}`;

        trainingPreorderCustomer.appendChild(
            option
        );
    });
}


function renderTrainingPreorderCategories(
    products
) {

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

    trainingPreorderCategories =
        categories;

    if (!categories.length) {

        trainingPreorderCategoryList.innerHTML = "";

        trainingPreorderProductList.innerHTML = `
            <p>
                No hay productos disponibles.
            </p>
        `;

        return;
    }

    trainingPreorderCategoryList.innerHTML = "";

    categories.forEach(category => {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "preorder-category";

        button.textContent =
            category.name;

        button.addEventListener(
            "click",
            () => {
                selectTrainingPreorderCategory(
                    category.id
                );
            }
        );

        trainingPreorderCategoryList.appendChild(
            button
        );
    });

    selectTrainingPreorderCategory(
        categories[0].id
    );
}


function selectTrainingPreorderCategory(
    categoryId
) {

    trainingPreorderSelectedCategoryId =
        categoryId;

    const buttons =
        trainingPreorderCategoryList.querySelectorAll(
            ".preorder-category"
        );

    buttons.forEach(button => {

        const category =
            trainingPreorderCategories.find(
                item =>
                    item.id === categoryId
            );

        button.classList.toggle(
            "selected",
            button.textContent === category?.name
        );
    });

    const products =
        trainingPreorderProducts.filter(
            product =>
                product.category_id === categoryId
        );

    trainingPreorderProductList.innerHTML = "";

    products.forEach(product => {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "preorder-product";

        button.textContent =
            `${product.name} — $${Number(product.price).toFixed(2)}`;

        button.addEventListener(
            "click",
            () => addTrainingPreorderProduct(product)
        );

        trainingPreorderProductList.appendChild(
            button
        );
    });
}

function addTrainingPreorderProduct(product) {

    const existingItem =
        trainingPreorderCart.find(
            item =>
                item.product_id === product.id
        );

    if (existingItem) {

        existingItem.quantity += 1;

    } else {

        trainingPreorderCart.push({
            product_id: product.id,
            name: product.name,
            unit_price: Number(product.price),
            quantity: 1
        });
    }

    renderTrainingPreorderCart();
    validateTrainingPreorderForm();
}


function renderTrainingPreorderCart() {

    if (!trainingPreorderCart.length) {

        trainingPreorderCartElement.innerHTML = `
            <p>
                No hay productos agregados.
            </p>
        `;

        trainingPreorderTotal.textContent =
            "$0.00";

        return;
    }

    trainingPreorderCartElement.innerHTML = "";

    let total = 0;

    trainingPreorderCart.forEach(item => {

        const lineTotal =
            item.unit_price * item.quantity;

        total += lineTotal;

        const row =
            document.createElement("div");

        row.className =
            "preorder-cart-item";


        const itemInfo =
            document.createElement("div");

        itemInfo.className =
            "preorder-cart-item-info";


        const name =
            document.createElement("strong");

        name.textContent =
            item.name;


        const unitPrice =
            document.createElement("span");

        unitPrice.textContent =
            `$${item.unit_price.toFixed(2)} c/u`;


        itemInfo.appendChild(name);
        itemInfo.appendChild(unitPrice);


        const controls =
            document.createElement("div");

        controls.className =
            "preorder-cart-item-controls";


        const decreaseButton =
            document.createElement("button");

        decreaseButton.type =
            "button";

        decreaseButton.className =
            "preorder-quantity-button";

        decreaseButton.textContent =
            "−";

        decreaseButton.addEventListener(
            "click",
            () => changeTrainingPreorderQuantity(
                item.product_id,
                -1
            )
        );


        const quantity =
            document.createElement("span");

        quantity.textContent =
            item.quantity;


        const increaseButton =
            document.createElement("button");

        increaseButton.type =
            "button";

        increaseButton.className =
            "preorder-quantity-button";

        increaseButton.textContent =
            "+";

        increaseButton.addEventListener(
            "click",
            () => changeTrainingPreorderQuantity(
                item.product_id,
                1
            )
        );


        const lineTotalElement =
            document.createElement("strong");

        lineTotalElement.textContent =
            `$${lineTotal.toFixed(2)}`;


        controls.appendChild(decreaseButton);
        controls.appendChild(quantity);
        controls.appendChild(increaseButton);
        controls.appendChild(lineTotalElement);


        row.appendChild(itemInfo);
        row.appendChild(controls);

        trainingPreorderCartElement.appendChild(
            row
        );
    });

    trainingPreorderTotal.textContent =
        `$${total.toFixed(2)}`;
}


function changeTrainingPreorderQuantity(
    productId,
    change
) {

    const item =
        trainingPreorderCart.find(
            cartItem =>
                cartItem.product_id === productId
        );

    if (!item) {
        return;
    }

    item.quantity += change;

    if (item.quantity <= 0) {

        trainingPreorderCart =
            trainingPreorderCart.filter(
                cartItem =>
                    cartItem.product_id !== productId
            );
    }

    renderTrainingPreorderCart();
    validateTrainingPreorderForm();
}

function validateTrainingPreorderForm() {

    const hasCustomer =
        Boolean(trainingPreorderCustomer.value);

    const pickupDate =
        document.getElementById(
            "training-preorder-pickup-date"
        ).value;

    const pickupTime =
        document.getElementById(
            "training-preorder-pickup-time"
        ).value;

    const hasProducts =
        trainingPreorderCart.length > 0;

    const isDelivery =
        trainingPreorderDelivery.value === "1";

    const deliveryAddress =
        trainingPreorderDeliveryAddress.value.trim();

    const hasDeliveryAddress =
        !isDelivery ||
        Boolean(deliveryAddress);

    const isValid =
        hasCustomer &&
        Boolean(pickupDate) &&
        Boolean(pickupTime) &&
        hasProducts &&
        hasDeliveryAddress;

    createTrainingPreorder.disabled =
        !isValid;

    return isValid;
}


function showTrainingPreorderError(
    message
) {

    trainingPreorderError.textContent =
        message;

    trainingPreorderError.classList.remove(
        "hidden"
    );

    trainingPreorderSuccess.classList.add(
        "hidden"
    );
}

function renderTrainingCounterSaleCustomers(
    customers
) {
    const customerSelect =
        document.getElementById(
            "training-counter-sale-customer"
        );

    customerSelect.innerHTML = `
        <option value="">
            Walk-in / No customer
        </option>
    `;

    customers.forEach(customer => {

        const option =
            document.createElement("option");

        option.value =
            customer.id;

        option.textContent =
            customer.name;

        customerSelect.appendChild(
            option
        );
    });
}

function renderTrainingCounterSaleCategories(products) {

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

    trainingCounterSaleCategories =
        categories;

    const categoryList =
        document.getElementById(
            "training-counter-sale-category-list"
        );

    if (!categories.length) {

        categoryList.innerHTML = "";

        document.getElementById(
            "training-counter-sale-product-list"
        ).innerHTML = `
            <p>
                No products available.
            </p>
        `;

        return;
    }

    categoryList.innerHTML = "";

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
                selectTrainingCounterSaleCategory(
                    category.id
                );
            }
        );

        categoryList.appendChild(button);
    });

    selectTrainingCounterSaleCategory(
        categories[0].id
    );
}


function selectTrainingCounterSaleCategory(categoryId) {

    trainingCounterSaleSelectedCategoryId =
        categoryId;

    const categoryList =
        document.getElementById(
            "training-counter-sale-category-list"
        );

    const productList =
        document.getElementById(
            "training-counter-sale-product-list"
        );

    const buttons =
        categoryList.querySelectorAll(
            ".counter-sale-category"
        );

    buttons.forEach(button => {

        button.classList.toggle(
            "selected",
            button.textContent ===
                trainingCounterSaleCategories.find(
                    category =>
                        category.id === categoryId
                )?.name
        );
    });

    const products =
        trainingCounterSaleProducts.filter(
            product =>
                product.category_id === categoryId
        );

    productList.innerHTML = "";

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
            () => addTrainingCounterSaleProduct(product)
        );

        productList.appendChild(button);
    });
}


function renderTrainingCounterSaleCustomProducts(
    customProducts
) {

    const productList =
        document.getElementById(
            "training-counter-sale-custom-product-list"
        );

    if (!customProducts.length) {

        productList.innerHTML = `
            <p>
                No custom products available.
            </p>
        `;

        return;
    }

    productList.innerHTML = "";

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
            () => addTrainingCounterSaleCustomProduct(product)
        );

        productList.appendChild(button);
    });
}

function addTrainingCounterSaleProduct(product) {

    const existingItem =
        trainingCounterSaleCart.find(
            item =>
                item.product_id === product.id
        );

    if (existingItem) {

        existingItem.quantity += 1;

    } else {

        trainingCounterSaleCart.push({
            product_id: product.id,
            name: product.name,
            unit_price: Number(product.price),
            quantity: 1
        });
    }

    renderTrainingCounterSaleCart();
}


function addTrainingCounterSaleCustomProduct(product) {

    const existingItem =
        trainingCounterSaleCart.find(
            item =>
                item.custom_product_id === product.id
        );

    if (existingItem) {

        existingItem.quantity += 1;

    } else {

        trainingCounterSaleCart.push({
            custom_product_id: product.id,
            name: product.name,
            unit_price: Number(product.price),
            quantity: 1
        });
    }

    renderTrainingCounterSaleCart();
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
// Back to Orders from Training

document
    .getElementById("back-to-orders-from-training")
    .addEventListener(
        "click",
        async () => {
            try {
                await setNormalMode();

                trainingView.classList.add("hidden");
                ordersView.classList.remove("hidden");

                loadOrders();

            } catch (error) {
                console.error(
                    "Failed to enter Normal Mode:",
                    error
                );

                alert(error.message);
            }
        }
    );

// Open Pickup List view

pickupListButton.addEventListener(
    "click",
    () => {

        ordersView.classList.add("hidden");
        newOrderView.classList.add("hidden");
        orderDetailView.classList.add("hidden");
        counterSaleView.classList.add("hidden");
        productionView.classList.add("hidden");

        pickupListView.classList.remove("hidden");

        loadPickupList();
    }
);


// Back from Pickup List to Orders

pickupListBackButton.addEventListener(
    "click",
    () => {

        pickupListView.classList.add("hidden");

        ordersView.classList.remove("hidden");

        loadOrders();
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

// Cancel Counter Sale and return to Orders

document
    .getElementById("cancel-counter-sale")
    .addEventListener(
        "click",
        () => {

            counterSaleView.classList.add("hidden");

            ordersView.classList.remove("hidden");

            loadOrders();
        }
    );

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

// Back from Order Detail

document
    .getElementById("back-to-orders")
    .addEventListener(
        "click",
        () => {

            orderDetailView.classList.add("hidden");

            if (orderDetailReturnView === "pickup") {

                pickupListView.classList.remove("hidden");

                loadPickupList();

                return;
            }

            ordersView.classList.remove("hidden");

            loadOrders();
        }
    );


// =========================================================
// Initial Load
// =========================================================

checkAuthentication();