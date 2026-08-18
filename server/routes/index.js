const express = require("express");
const router = express.Router();

const orders = require("../models/order");
const customers = require("../models/customer");
const products = require("../models/product");
const { requireAdmin } = require("../middleware/auth");

// =========================================================
// Customers
// =========================================================

router.get("/customers", (req, res) => {
    try {
        const result = customers.getAllCustomers();

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error("GET /api/customers error:", error);

        res.status(500).json({
            success: false,
            error: "Failed to retrieve customers."
        });
    }
});


router.get("/customers/:id", (req, res) => {
    try {
        const customerId = Number(req.params.id);

        if (
            !Number.isInteger(customerId) ||
            customerId <= 0
        ) {
            return res.status(400).json({
                success: false,
                error: "Invalid customer ID."
            });
        }

        const customer =
            customers.getCustomerById(customerId);

        if (!customer) {
            return res.status(404).json({
                success: false,
                error: "Customer not found."
            });
        }

        res.json({
            success: true,
            data: customer
        });

    } catch (error) {
        console.error(
            "GET /api/customers/:id error:",
            error
        );

        res.status(500).json({
            success: false,
            error: "Failed to retrieve customer."
        });
    }
});

// =========================================================
// Products
// =========================================================

router.get("/products", (req, res) => {
    try {
        const result = products.getAllProducts();

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error("GET /api/products error:", error);

        res.status(500).json({
            success: false,
            error: "Failed to retrieve products."
        });
    }
});


router.get("/products/:id", (req, res) => {
    try {
        const productId = Number(req.params.id);

        if (
            !Number.isInteger(productId) ||
            productId <= 0
        ) {
            return res.status(400).json({
                success: false,
                error: "Invalid product ID."
            });
        }

        const product =
            products.getProductById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                error: "Product not found."
            });
        }

        res.json({
            success: true,
            data: product
        });

    } catch (error) {
        console.error(
            "GET /api/products/:id error:",
            error
        );

        res.status(500).json({
            success: false,
            error: "Failed to retrieve product."
        });
    }
});

router.get("/categories", (req, res) => {
    try {
        const result = products.getAllCategories();

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error(
            "GET /api/categories error:",
            error
        );

        res.status(500).json({
            success: false,
            error: "Failed to retrieve categories."
        });
    }
});

router.get("/categories/:id/products", (req, res) => {
    try {
        const categoryId = Number(req.params.id);

        if (
            !Number.isInteger(categoryId) ||
            categoryId <= 0
        ) {
            return res.status(400).json({
                success: false,
                error: "Invalid category ID."
            });
        }

        const result =
            products.getProductsByCategory(categoryId);

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error(
            "GET /api/categories/:id/products error:",
            error
        );

        res.status(500).json({
            success: false,
            error: "Failed to retrieve products."
        });
    }
});

// =========================================================
// Product Administration
// =========================================================

router.post("/products", requireAdmin, (req, res) => {
    try {
        const {
            sku,
            category_id,
            name,
            description = null,
            price,
            unit = "each",
            display_order = 0
        } = req.body;

        const product = products.createProduct({
            sku,
            category_id,
            name,
            description,
            price,
            unit,
            display_order,
            user_id: req.user.id
        });

        res.status(201).json({
            success: true,
            data: product
        });

    } catch (error) {
        console.error("POST /api/products error:", error);

        if (
            error.message.includes("required") ||
            error.message.includes("valid") ||
            error.message.includes("price") ||
            error.message.includes("Category") ||
            error.message.includes("SKU already exists")
        ) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: "Failed to create product."
        });
    }
});


router.put("/products/:id", requireAdmin, (req, res) => {
    try {
        const productId = Number(req.params.id);

        if (!Number.isInteger(productId) || productId <= 0) {
            return res.status(400).json({
                success: false,
                error: "Invalid product ID."
            });
        }

        const {
            sku,
            category_id,
            name,
            description = null,
            price,
            unit = "each",
            display_order = 0
        } = req.body;

        const product = products.updateProduct({
            id: productId,
            sku,
            category_id,
            name,
            description,
            price,
            unit,
            display_order,
            user_id: req.user.id
        });

        res.json({
            success: true,
            data: product
        });

    } catch (error) {
        console.error("PUT /api/products/:id error:", error);

        if (
            error.message.includes("not found")
        ) {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }

        if (
            error.message.includes("required") ||
            error.message.includes("valid") ||
            error.message.includes("price") ||
            error.message.includes("Category") ||
            error.message.includes("SKU already exists")
        ) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: "Failed to update product."
        });
    }
});


router.patch("/products/:id/active", requireAdmin, (req, res) => {
    try {
        const productId = Number(req.params.id);

        if (!Number.isInteger(productId) || productId <= 0) {
            return res.status(400).json({
                success: false,
                error: "Invalid product ID."
            });
        }

        const { active } = req.body;

        const product = products.setProductActive({
            id: productId,
            active,
            user_id: req.user.id
        });

        res.json({
            success: true,
            data: product
        });

    } catch (error) {
        console.error(
            "PATCH /api/products/:id/active error:",
            error
        );

        if (
            error.message.includes("not found")
        ) {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }

        if (
            error.message.includes("valid") ||
            error.message.includes("Active")
        ) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: "Failed to update product status."
        });
    }
});

// =========================================================
// Orders
// =========================================================

router.get("/orders", (req, res) => {
    try {
        const result = orders.getAllOrders();

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error("GET /api/orders error:", error);

        res.status(500).json({
            success: false,
            error: "Failed to retrieve orders."
        });
    }
});

router.get("/orders/:id", (req, res) => {
    try {
        const orderId = Number(req.params.id);

        if (!Number.isInteger(orderId) || orderId <= 0) {
            return res.status(400).json({
                success: false,
                error: "Invalid order ID."
            });
        }

        const order = orders.getOrderById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                error: "Order not found."
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error("GET /api/orders/:id error:", error);

        res.status(500).json({
            success: false,
            error: "Failed to retrieve order."
        });
    }
});

router.post("/orders", (req, res) => {
    try {
        const {
            order_number,
            customer_id,
            pickup_date,
            pickup_time,
            delivery,
            delivery_address,
            notes
        } = req.body;

        if (!order_number) {
            return res.status(400).json({
                success: false,
                error: "Order number is required."
            });
        }

        if (!customer_id) {
            return res.status(400).json({
                success: false,
                error: "Customer ID is required."
            });
        }

        const order = orders.createOrder({
            order_number,
            customer_id,
            pickup_date,
            pickup_time,
            delivery,
            delivery_address,
            notes,
            created_by: req.user.id
        });

        res.status(201).json({
            success: true,
            data: order
        });

    } catch (error) {
        console.error("POST /api/orders error:", error);

        res.status(500).json({
            success: false,
            error: "Failed to create order."
        });
    }
});

router.post("/orders/:id/items", (req, res) => {
    try {
        const orderId = Number(req.params.id);

        const {
            product_id = null,
            custom_name = null,
            unit_price = null,
            quantity,
            notes = null
        } = req.body;


        if (!Number.isInteger(orderId) || orderId <= 0) {
            return res.status(400).json({
                success: false,
                error: "Invalid order ID."
            });
        }


        const hasProduct =
            Number.isInteger(product_id) &&
            product_id > 0;


        const hasCustomItem =
            typeof custom_name === "string" &&
            custom_name.trim().length > 0 &&
            Number.isFinite(unit_price) &&
            unit_price >= 0;


        if (!hasProduct && !hasCustomItem) {
            return res.status(400).json({
                success: false,
                error: "Provide either a valid product ID or a custom item name and price."
            });
        }


        if (!Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({
                success: false,
                error: "Quantity must be greater than zero."
            });
        }


        const order = orders.addOrderItem({
            order_id: orderId,
            product_id,
            custom_name,
            unit_price,
            quantity,
            notes,
            user_id: req.user.id
        });


        res.status(201).json({
            success: true,
            data: order
        });


    } catch (error) {
        console.error(
            "POST /api/orders/:id/items error:",
            error
        );

        if (
            error.message.includes("authorization")
        ) {
            return res.status(403).json({
                success: false,
                error: error.message
            });
        }

        if (
            error.message.includes("not found") ||
            error.message.includes("inactive") ||
            error.message.includes("Quantity") ||
            error.message.includes("Custom") ||
            error.message.includes("valid user ID")
        ) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }


        res.status(500).json({
            success: false,
            error: "Failed to add order item."
        });
    }
});

router.put("/orders/:id/items/:itemId", (req, res) => {
    try {
        const orderId = Number(req.params.id);
        const itemId = Number(req.params.itemId);
        const { quantity, notes } = req.body;

        if (!Number.isInteger(orderId) || orderId <= 0) {
            return res.status(400).json({
                success: false,
                error: "Invalid order ID."
            });
        }

        if (!Number.isInteger(itemId) || itemId <= 0) {
            return res.status(400).json({
                success: false,
                error: "Invalid order item ID."
            });
        }

        if (!Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({
                success: false,
                error: "Quantity must be greater than zero."
            });
        }

        const order = orders.updateOrderItem(
            orderId,
            itemId,
            {
                quantity,
                notes
            }
        );

        res.json({
            success: true,
            data: order
        });

    } catch (error) {
        console.error(
            "PUT /api/orders/:id/items/:itemId error:",
            error
        );

        if (
            error.message.includes("not found") ||
            error.message.includes("does not belong")
        ) {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }

        if (
            error.message.includes(
                "cannot be less than amount already paid"
            )
        ) {
            return res.status(409).json({
                success: false,
                error: error.message
            });
        }

        if (
            error.message.includes("Quantity")
        ) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: "Failed to update order item."
        });
    }
});

router.put(
    "/orders/:id/items/:itemId/status",
    (req, res) => {

    try {
        const orderId = Number(req.params.id);
        const itemId = Number(req.params.itemId);

        const {
            production_status
        } = req.body;


        if (!Number.isInteger(orderId) || orderId <= 0) {
            return res.status(400).json({
                success: false,
                error: "Invalid order ID."
            });
        }


        if (!Number.isInteger(itemId) || itemId <= 0) {
            return res.status(400).json({
                success: false,
                error: "Invalid order item ID."
            });
        }


        const order =
            orders.updateOrderItemProductionStatus(
                orderId,
                itemId,
                production_status
            );


        res.json({
            success: true,
            data: order
        });


    } catch (error) {

        console.error(
            "PUT /api/orders/:id/items/:itemId/status error:",
            error
        );

        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

router.delete("/orders/:id/items/:itemId", (req, res) => {
    try {
        const orderId = Number(req.params.id);
        const itemId = Number(req.params.itemId);

        if (!Number.isInteger(orderId) || orderId <= 0) {
            return res.status(400).json({
                success: false,
                error: "Invalid order ID."
            });
        }

        if (!Number.isInteger(itemId) || itemId <= 0) {
            return res.status(400).json({
                success: false,
                error: "Invalid order item ID."
            });
        }

        const order = orders.removeOrderItem(
            orderId,
            itemId
        );

        res.json({
            success: true,
            data: order
        });

    } catch (error) {
        console.error(
            "DELETE /api/orders/:id/items/:itemId error:",
            error
        );

        if (
    error.message.includes("not found") ||
    error.message.includes("does not belong")
) {
    return res.status(404).json({
        success: false,
        error: error.message
    });
}

if (
    error.message.includes("already been picked up")
) {
    return res.status(409).json({
        success: false,
        error: error.message
    });
}

        if (
    error.message.includes("cannot be less than amount already paid")
) {
    return res.status(409).json({
        success: false,
        error: error.message
    });
}

        res.status(500).json({
            success: false,
            error: "Failed to remove order item."
        });
    }
});

router.post("/orders/:id/items/:itemId/pickup", (req, res) => {
    try {
        const orderId = Number(req.params.id);
        const itemId = Number(req.params.itemId);

        const {
            quantity,
            notes
        } = req.body;

        if (!Number.isInteger(orderId) || orderId <= 0) {
            return res.status(400).json({
                success: false,
                error: "Invalid order ID."
            });
        }

        if (!Number.isInteger(itemId) || itemId <= 0) {
            return res.status(400).json({
                success: false,
                error: "Invalid order item ID."
            });
        }

        if (!Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({
                success: false,
                error: "Pickup quantity must be greater than zero."
            });
        }

        const order = orders.recordItemPickup(
            orderId,
            itemId,
            quantity,
            req.user.id,
            notes
        );

        res.json({
            success: true,
            data: order
        });

    } catch (error) {
        console.error(
            "POST /api/orders/:id/items/:itemId/pickup error:",
            error
        );

        if (
            error.message.includes("not found") ||
            error.message.includes("does not belong") ||
            error.message.includes("Pickup quantity")
        ) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: "Failed to record item pickup."
        });
    }
});

router.get("/orders/:id/pickups", (req, res) => {
    try {
        const orderId = Number(req.params.id);

        if (!Number.isInteger(orderId) || orderId <= 0) {
            return res.status(400).json({
                success: false,
                error: "Invalid order ID."
            });
        }

        const pickups = orders.getPickupHistory(orderId);

        res.json({
            success: true,
            data: pickups
        });

    } catch (error) {
        console.error(
            "GET /api/orders/:id/pickups error:",
            error
        );

        if (error.message.includes("not found")) {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: "Failed to retrieve pickup history."
        });
    }
});

router.put("/orders/:id/status", (req, res) => {
    try {
        const orderId = Number(req.params.id);
        const { status } = req.body;

        if (!Number.isInteger(orderId) || orderId <= 0) {
            return res.status(400).json({
                success: false,
                error: "Invalid order ID."
            });
        }

        if (!status || typeof status !== "string") {
            return res.status(400).json({
                success: false,
                error: "Order status is required."
            });
        }

        const order = orders.updateOrderStatus(
            orderId,
            status
        );

        res.json({
            success: true,
            data: order
        });

    } catch (error) {
    console.error(
        "PUT /api/orders/:id/status error:",
        error
    );

    if (
        error.message.includes("Invalid order status") ||
        error.message.includes("not found")
    ) {
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }

    res.status(500).json({
        success: false,
        error: "Failed to update order status."
    });
}
});

router.post("/orders/:id/payments", (req, res) => {
    try {
        const orderId = Number(req.params.id);

        const {
            amount,
            payment_method,
            reference,
            notes
        } = req.body;

        if (!Number.isInteger(orderId) || orderId <= 0) {
            return res.status(400).json({
                success: false,
                error: "Invalid order ID."
            });
        }

        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                error: "Payment amount must be greater than zero."
            });
        }

        if (!payment_method) {
            return res.status(400).json({
                success: false,
                error: "Payment method is required."
            });
        }

        const order = orders.recordPayment({
            orderId,
            amount,
            paymentMethod: payment_method,
            reference,
            recordedBy: req.user.id,
            notes
        });

        res.status(201).json({
            success: true,
            data: order
        });

    } catch (error) {
        console.error(
            "POST /api/orders/:id/payments error:",
            error
        );

        if (
            error.message.includes("not found") ||
            error.message.includes("Payment amount") ||
            error.message.includes("Invalid payment method") ||
            error.message.includes("Payment exceeds")
        ) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: "Failed to record payment."
        });
    }
});

router.get("/orders/:id/payments", (req, res) => {
    try {
        const orderId = Number(req.params.id);

        if (!Number.isInteger(orderId) || orderId <= 0) {
            return res.status(400).json({
                success: false,
                error: "Invalid order ID."
            });
        }

        const payments = orders.getPaymentHistory(orderId);

        res.json({
            success: true,
            data: payments
        });

    } catch (error) {
        console.error(
            "GET /api/orders/:id/payments error:",
            error
        );

        if (error.message.includes("not found")) {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: "Failed to retrieve payment history."
        });
    }
});

module.exports = router;