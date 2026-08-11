const express = require("express");
const router = express.Router();

const orders = require("../models/order");

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
            notes,
            created_by
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
            created_by
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
            notes
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
            error.message.includes("not found") ||
            error.message.includes("inactive") ||
            error.message.includes("Quantity") ||
            error.message.includes("Custom")
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
            picked_up_by,
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
            picked_up_by,
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
            recorded_by,
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
            recordedBy: recorded_by,
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