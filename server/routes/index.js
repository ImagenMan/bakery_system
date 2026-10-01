const express = require("express");
const router = express.Router();

const {
    models,
    productionDb,
    trainingDb
} = require("../models/context");

const {
    getHistory,
    calculateHistoryDashboard
} = require("../models/history");

const { requireAdmin } = require("../middleware/auth");

const {
    getBusinessDate,
    getCurrentEventAt,
    getBusinessDateUtcRange
} = require("../utils/businessTime");

const {
    importWeatherForDailyRecord
} = require("../services/weather/importWeather");

// =========================================================
// Application Mode
// =========================================================

router.post("/mode", (req, res) => {
    try {
        const { mode } = req.body;

        if (mode !== "NORMAL" && mode !== "TRAINING") {
            return res.status(400).json({
                success: false,
                error: "Invalid application mode."
            });
        }

        req.session.mode = mode;

        res.json({
            success: true,
            mode
        });

    } catch (error) {
        console.error("POST /api/mode error:", error);

        res.status(500).json({
            success: false,
            error: "Failed to change application mode."
        });
    }
});

router.get("/mode", (req, res) => {
    const mode =
        req.session.mode === "TRAINING"
            ? "TRAINING"
            : "NORMAL";

    res.json({
        success: true,
        mode
    });
});

// =========================================================
// History
// =========================================================

router.get(
    "/history",
    (req, res) => {
        try {
            const { date } = req.query;

            if (
                typeof date !== "string" ||
                !date.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    error:
                        "Date is required in YYYY-MM-DD format."
                });
            }

            const {
                startDate,
                endDate
            } =
                getBusinessDateUtcRange(
                    date
                );

            const events =
                getHistory({
                    mode:
                        req.mode === "TRAINING"
                            ? "training"
                            : "normal",
                    startDate,
                    endDate
                });

            const dashboard =
                calculateHistoryDashboard(
                    events
                );

            const weatherRecord =
                req.models.dailyWeather
                    .getWeatherByDate(
                        date
                    );

            dashboard.weather =
                weatherRecord
                    ? {
                        temperature_high:
                            weatherRecord.temperature_high,
                        temperature_low:
                            weatherRecord.temperature_low,
                        precipitation:
                            weatherRecord.precipitation,
                        rain:
                            weatherRecord.rain,
                        source:
                            weatherRecord.source,
                        retrieved_at:
                            weatherRecord.retrieved_at
                    }
                    : null;

            res.json({
                success: true,
                data: {
                    dashboard,
                    events
                }
            });

        } catch (error) {
            console.error(
                "GET /api/history error:",
                error
            );

            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }
);

// =========================================================
// Weather
// =========================================================

router.post(
    "/weather/import",
    requireAdmin,
    async (req, res) => {
        try {
            const {
                record_date
            } = req.body;

            if (
                typeof record_date !== "string" ||
                !record_date.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    error:
                        "Record date is required."
                });
            }

            const dailyRecord =
                req.models.dailyRecord
                    .getDailyRecordByDate(
                        record_date
                    );

            if (!dailyRecord) {
                return res.status(400).json({
                    success: false,
                    error:
                        `Daily record for ${record_date} not found.`
                });
            }

            const weather =
                await importWeatherForDailyRecord({
                    dailyRecordId:
                        dailyRecord.id,
                    recordDate:
                        dailyRecord.record_date,
                    dailyWeather:
                        req.models.dailyWeather
                });

            res.json({
                success: true,
                data: {
                    dailyRecord,
                    weather
                }
            });

        } catch (error) {
            console.error(
                "POST /api/weather/import error:",
                error
            );

            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }
);

// =========================================================
// Business Day Status
// =========================================================

router.get(
    "/business-day/status",
    (req, res) => {
        try {
            const recordDate =
                getBusinessDate();

            const dailyRecord =
                req.models.dailyRecord
                    .getDailyRecordByDate(recordDate);

            if (!dailyRecord) {
                return res.json({
                    success: true,
                    data: {
                        record_date: recordDate,
                        daily_record_id: null,
                        business_day_open: false,
                        production_day_closed: false,
                        business_day_closed: false
                    }
                });
            }

            const businessDayOpeningEvent =
                req.models.operationalEvent
                    .getBusinessDayOpeningEvent(
                        dailyRecord.id
                    );

            const productionDayClosed =
                req.models.operationalEvent
                    .isProductionDayClosed(recordDate);

            res.json({
                success: true,
                data: {
                    record_date: recordDate,
                    daily_record_id:
                        dailyRecord.id,
                    business_day_open:
                        Boolean(
                            businessDayOpeningEvent
                        ),
                    production_day_closed:
                        productionDayClosed,
                    business_day_closed:
                        Boolean(
                            dailyRecord.closed_at
                        )
                }
            });

        } catch (error) {
            console.error(
                "GET /api/business-day/status error:",
                error
            );

            res.status(500).json({
                success: false,
                error:
                    "Failed to retrieve business day status."
            });
        }
    }
);

// =========================================================
// Operational Events
// =========================================================

router.post(
    "/operational-events",
    requireAdmin,
    (req, res) => {
        try {
            const {
                event_type,
                record_date,
                event_at,
                notes
            } = req.body;

            const allowedEventTypes = [
                "POWER_OUTAGE",
                "EQUIPMENT_ISSUE",
                "OTHER"
            ];

            if (
                !allowedEventTypes.includes(
                    event_type
                )
            ) {
                return res.status(400).json({
                    success: false,
                    error:
                        "Event type must be POWER_OUTAGE, EQUIPMENT_ISSUE, or OTHER."
                });
            }

            if (
                typeof record_date !== "string" ||
                !record_date.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    error:
                        "Record date is required."
                });
            }

            const dailyRecord =
                req.models.dailyRecord
                    .getDailyRecordByDate(
                        record_date
                    );

            if (!dailyRecord) {
                return res.status(400).json({
                    success: false,
                    error:
                        `Daily record for ${record_date} not found.`
                });
            }

            if (
                typeof event_at !== "string" ||
                !event_at.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    error:
                        "Event time is required."
                });
            }

            const event =
                req.models.operationalEvent
                    .createOperationalEvent({
                        event_type,
                        event_at,
                        daily_record_id:
                            dailyRecord.id,
                        user_id:
                            req.mode === "TRAINING"
                                ? 1
                                : req.user.id,
                        notes:
                            typeof notes === "string" &&
                            notes.trim()
                                ? notes.trim()
                                : null
                    });

            res.json({
                success: true,
                data: event
            });

        } catch (error) {
            console.error(
                "POST /api/operational-events error:",
                error
            );

            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }
);

// =========================================================
// Business Day
// =========================================================

router.post(
    "/business-day/open",
    requireAdmin,
    (req, res) => {
        try {
            const recordDate =
                getBusinessDate();

            const eventAt =
                getCurrentEventAt();

            const db =
                req.mode === "TRAINING"
                    ? trainingDb
                    : productionDb;

            const result =
                db.transaction(() => {
                    const dailyRecord =
                        req.models.dailyRecord
                            .openDailyRecord(recordDate);

                    const event =
                        req.models.operationalEvent
                            .openBusinessDay({
                                daily_record_id:
                                    dailyRecord.id,
                                event_at:
                                    eventAt,
                                user_id:
                                    req.mode === "TRAINING"
                                        ? 1
                                        : req.user.id
                            });

                    return {
                        dailyRecord,
                        event
                    };
                })();

            res.json({
                success: true,
                data: result
            });

        } catch (error) {
            console.error(
                "POST /api/business-day/open error:",
                error
            );

            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }
);

router.post(
    "/business-day/close",
    requireAdmin,
    async (req, res) => {
        try {
            const recordDate =
                getBusinessDate();

            const eventAt =
                getCurrentEventAt();

            const db =
                req.mode === "TRAINING"
                    ? trainingDb
                    : productionDb;

            const result =
                db.transaction(() => {
                    const dailyRecord =
                        req.models.dailyRecord
                            .findDailyRecordByDate(recordDate);

                    const openingEvent =
                        req.models.operationalEvent
                            .getBusinessDayOpeningEvent(
                                dailyRecord.id
                            );

                    if (!openingEvent) {
                        throw new Error(
                            `Business day for ${recordDate} has not been opened.`
                        );
                    }

                    if (dailyRecord.closed_at !== null) {
                        throw new Error(
                            `Daily record for ${recordDate} is already closed.`
                        );
                    }

                    const productionDayClosed =
                        req.models.operationalEvent
                            .isProductionDayClosed(recordDate);

                    if (!productionDayClosed) {
                        throw new Error(
                            `Production day for ${recordDate} must be closed before the business day can be closed.`
                        );
                    }

                    const closedRecord =
                        req.models.dailyRecord
                            .closeDailyRecord(recordDate);

                    const event =
                        req.models.operationalEvent
                            .closeBusinessDay({
                                daily_record_id:
                                    closedRecord.id,
                                event_at:
                                    eventAt,
                                user_id:
                                    req.mode === "TRAINING"
                                        ? 1
                                        : req.user.id
                            });

                    return {
                        dailyRecord:
                            closedRecord,
                        event
                    };
                })();

            if (req.mode !== "TRAINING") {
                const existingWeather =
                    req.models.dailyWeather
                        .getWeatherByDailyRecordId(
                            result.dailyRecord.id
                        );

                if (!existingWeather) {
                    try {
                        await importWeatherForDailyRecord({
                            dailyRecordId:
                                result.dailyRecord.id,
                            recordDate,
                            dailyWeather:
                                req.models.dailyWeather
                        });
                    } catch (error) {
                        console.error(
                            "Automatic weather import failed:",
                            error
                        );
                    }
                }
            }

            res.json({
                success: true,
                data: result
            });

        } catch (error) {
            console.error(
                "POST /api/business-day/close error:",
                error
            );

            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }
);

router.post(
    "/business-day/reopen",
    requireAdmin,
    (req, res) => {
        try {
            const recordDate =
                getBusinessDate();

            const eventAt =
                getCurrentEventAt();

            const db =
                req.mode === "TRAINING"
                    ? trainingDb
                    : productionDb;

            const result =
                db.transaction(() => {
                    const dailyRecord =
                        req.models.dailyRecord
                            .findDailyRecordByDate(
                                recordDate
                            );

                    if (!dailyRecord) {
                        throw new Error(
                            `No daily record exists for ${recordDate}.`
                        );
                    }

                    if (
                        dailyRecord.closed_at === null
                    ) {
                        throw new Error(
                            `Business day for ${recordDate} is not closed.`
                        );
                    }

                    const openingEvent =
                        req.models.operationalEvent
                            .getBusinessDayOpeningEvent(
                                dailyRecord.id
                            );

                    if (!openingEvent) {
                        throw new Error(
                            `Business day for ${recordDate} has not been opened.`
                        );
                    }

                    const productionDayClosed =
                        req.models.operationalEvent
                            .isProductionDayClosed(
                                recordDate
                            );

                    if (!productionDayClosed) {
                        throw new Error(
                            `Production day for ${recordDate} must be closed before the business day can be reopened.`
                        );
                    }

                    const reopenedRecord =
                        req.models.dailyRecord
                            .reopenDailyRecord(
                                recordDate
                            );

                    const event =
                        req.models.operationalEvent
                            .reopenBusinessDay({
                                daily_record_id:
                                    reopenedRecord.id,
                                event_at:
                                    eventAt,
                                user_id:
                                    req.mode === "TRAINING"
                                        ? 1
                                        : req.user.id
                            });

                    return {
                        dailyRecord:
                            reopenedRecord,
                        event
                    };
                })();

            res.json({
                success: true,
                data: result
            });

        } catch (error) {
            console.error(
                "POST /api/business-day/reopen error:",
                error
            );

            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }
);

// =========================================================
// Customers
// =========================================================

router.get("/customers", (req, res) => {
    try {
        const result = req.models.customer.getAllCustomers();

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error("GET /api/customers error:", error);

        res.status(500).json({
            success: false,
            error: "Failed to retrieve req.models.customer."
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
            req.models.customer.getCustomerById(customerId);

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
        const result = req.models.product.getAllProducts();

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error("GET /api/products error:", error);

        res.status(500).json({
            success: false,
            error: "Failed to retrieve req.models.product."
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
            req.models.product.getProductById(productId);

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
        const result = req.models.product.getAllCategories();

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
            req.models.product.getProductsByCategory(categoryId);

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
            error: "Failed to retrieve req.models.product."
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

        const product = req.models.product.createProduct({
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

        const product = req.models.product.updateProduct({
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

        const product = req.models.product.setProductActive({
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
// Custom Products
// =========================================================

router.get("/custom-products", (req, res) => {
    try {
        const result =
            req.models.customProduct.getActiveCustomProducts();

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error(
            "GET /api/custom-products error:",
            error
        );

        res.status(500).json({
            success: false,
            error: "Failed to retrieve custom req.models.product."
        });
    }
});

router.get("/custom-products/:id", (req, res) => {
    try {
        const customProductId = Number(req.params.id);

        if (
            !Number.isInteger(customProductId) ||
            customProductId <= 0
        ) {
            return res.status(400).json({
                success: false,
                error: "Invalid custom product ID."
            });
        }

        const product =
            req.models.customProduct.getCustomProductById(
                customProductId
            );

        if (!product) {
            return res.status(404).json({
                success: false,
                error: "Custom product not found."
            });
        }

        res.json({
            success: true,
            data: product
        });

    } catch (error) {
        console.error(
            "GET /api/custom-products/:id error:",
            error
        );

        res.status(500).json({
            success: false,
            error: "Failed to retrieve custom product."
        });
    }
});

router.post("/custom-products", requireAdmin, (req, res) => {
    try {
        const {
            name,
            price,
            description = null
        } = req.body;

        const product =
            req.models.customProduct.createCustomProduct({
                name,
                price,
                description,
                user_id: req.user.id
            });

        res.status(201).json({
            success: true,
            data: product
        });

    } catch (error) {
        console.error(
            "POST /api/custom-products error:",
            error
        );

        if (
            error.message.includes("required") ||
            error.message.includes("price") ||
            error.message.includes("valid")
        ) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: "Failed to create custom product."
        });
    }
});

router.patch("/custom-products/:id/active", requireAdmin, (req, res) => {
    try {
        const customProductId = Number(req.params.id);

        if (
            !Number.isInteger(customProductId) ||
            customProductId <= 0
        ) {
            return res.status(400).json({
                success: false,
                error: "Invalid custom product ID."
            });
        }

        const { active } = req.body;

        const product =
            req.models.customProduct.setCustomProductActive({
                id: customProductId,
                active,
                user_id: req.user.id
            });

        res.json({
            success: true,
            data: product
        });

    } catch (error) {
        console.error(
            "PATCH /api/custom-products/:id/active error:",
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
            error.message.includes("Active") ||
            error.message.includes("authorization")
        ) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: "Failed to update custom product status."
        });
    }
});

// =========================================================
// Orders
// =========================================================

router.get("/orders", (req, res) => {
    try {
        const result = req.models.order.getAllOrders();

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error("GET /api/orders error:", error);

        res.status(500).json({
            success: false,
            error: "Failed to retrieve req.models.order."
        });
    }
});

router.get("/pickups", (req, res) => {
    try {
        const pickupDate = req.query.date;

        if (!/^\d{4}-\d{2}-\d{2}$/.test(pickupDate || "")) {
            return res.status(400).json({
                success: false,
                error: "A valid pickup date in YYYY-MM-DD format is required."
            });
        }

        const orders =
            req.models.order.getPickupOrdersByDate(pickupDate);

        res.json({
            success: true,
            data: orders
        });

    } catch (error) {
        console.error("GET /api/pickups error:", error);

        res.status(500).json({
            success: false,
            error: "Failed to retrieve pickup orders."
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

        const order = req.models.order.getOrderById(orderId);

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
            order_number = null,
            customer_id,
            order_type = "PREORDER",
            pickup_date,
            pickup_time,
            delivery,
            delivery_address,
            notes
        } = req.body;

        if (order_type === "PREORDER" && !customer_id) {
            return res.status(400).json({
                success: false,
                error: "Customer ID is required."
            });
        }

        if (!["PREORDER", "COUNTER_SALE"].includes(order_type)) {
            return res.status(400).json({
                success: false,
                error: "Invalid order type."
            });
        }

        const order = req.models.order.createOrder({
            order_number,
            customer_id,
            order_type,
            pickup_date,
            pickup_time,
            delivery,
            delivery_address,
            notes,
            created_by:
                req.mode === "TRAINING"
                    ? 1
                    : req.user.id
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

router.post("/preorders", (req, res) => {
    try {
        const {
            customer_id,
            pickup_date = null,
            pickup_time = null,
            delivery = 0,
            delivery_address = null,
            notes = null,
            items
        } = req.body;

        if (!customer_id) {
            return res.status(400).json({
                success: false,
                error: "Customer ID is required."
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                error:
                    "A preorder must contain at least one item."
            });
        }

        const order = req.models.order.createPreorder({
            customer_id,
            pickup_date,
            pickup_time,
            delivery,
            delivery_address,
            notes,
            items,
            created_by:
                req.mode === "TRAINING"
                    ? 1
                    : req.user.id
        });

        res.status(201).json({
            success: true,
            data: order
        });

    } catch (error) {
        console.error(
            "POST /api/preorders error:",
            error
        );

        res.status(400).json({
            success: false,
            error:
                error.message ||
                "Failed to create preorder."
        });
    }
});

router.get("/counter/today", (req, res) => {
    try {
        const items = req.models.inventory.getCounterAvailableInventory();

        const categories = [];

        for (const item of items) {
            let category = categories.find(
                existing => existing.category_id === item.category_id
            );

            if (!category) {
                category = {
                    category_id: item.category_id,
                    category_code: item.category_code,
                    category_name: item.category_name,
                    category_display_order: item.category_display_order,
                    total_quantity: 0,
                    products: []
                };

                categories.push(category);
            }

            category.total_quantity += Number(item.available_quantity);

            category.products.push({
                production_item_id: item.production_item_id,
                product_id: item.product_id,
                sku: item.sku,
                product_name: item.product_name,
                unit: item.unit,
                available_quantity: Number(item.available_quantity),
                product_display_order: item.product_display_order
            });
        }

        res.json({
            categories
        });
    } catch (error) {
        console.error("GET /api/counter/today error:", error);

        res.status(500).json({
            error: error.message || "Failed to load counter availability."
        });
    }
});

router.post("/counter-sales", (req, res) => {
    try {
        const {
            customer_id = null,
            items,
            payment_method,
            cash_received = null,
            reference = null,
            notes = null
        } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                error: "A counter sale must contain at least one item."
            });
        }

        if (!payment_method) {
            return res.status(400).json({
                success: false,
                error: "Payment method is required."
            });
        }

        const result = req.models.order.createCounterSale({
            customer_id,
            items,
            payment_method,
            cash_received,
            reference,
            notes,
            created_by:
                req.mode === "TRAINING"
                    ? 1
                    : req.user.id,
            authorization_user_id: req.user.id
        });

        res.status(201).json({
            success: true,
            order: result.order,
            change: result.change
        });
    } catch (error) {
        console.error("POST /api/counter-sales error:", error);

        res.status(400).json({
            success: false,
            error: error.message || "Failed to complete counter sale."
        });
    }
});

router.post("/orders/:id/items", (req, res) => {
    try {
        const orderId = Number(req.params.id);

        const {
            product_id = null,
            custom_product_id = null,
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

        const hasCustomProduct =
            Number.isInteger(custom_product_id) &&
            custom_product_id > 0;

        const hasCustomItem =
            typeof custom_name === "string" &&
            custom_name.trim().length > 0 &&
            Number.isFinite(unit_price) &&
            unit_price >= 0;

        const itemSourceCount =
            Number(hasProduct) +
            Number(hasCustomProduct) +
            Number(hasCustomItem);

        if (itemSourceCount !== 1) {
            return res.status(400).json({
                success: false,
                error:
                    "Provide exactly one of product_id, custom_product_id, or custom_name with unit_price."
            });
        }


        if (!Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({
                success: false,
                error: "Quantity must be greater than zero."
            });
        }


        const order = req.models.order.addOrderItem({
            order_id: orderId,
            product_id,
            custom_product_id,
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
            error.message.includes("Price") ||
            error.message.includes("valid user ID") ||
            error.message.includes("cannot be modified")
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

router.put("/orders/:id/details", (req, res) => {
    const orderId = Number(req.params.id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
        return res.status(400).json({
            success: false,
            error: "Invalid order ID."
        });
    }

    const {
        customer_id,
        pickup_date,
        pickup_time,
        delivery,
        delivery_address,
        notes
    } = req.body;

    try {
        const order = req.models.order.updateOrderDetails(orderId, {
            customer_id,
            pickup_date,
            pickup_time,
            delivery,
            delivery_address,
            notes
        });

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error("Update order details error:", error);

        if (
            error.message.includes("not found") ||
            error.message.includes("Invalid customer")
        ) {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }

        if (
            error.message.includes("cannot be modified") ||
            error.message.includes("Delivery must be")
        ) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: "Failed to update order details."
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

        const order = req.models.order.updateOrderItem(
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
            error.message.includes("Quantity") ||
            error.message.includes("cannot be modified")
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
            req.models.order.updateOrderItemProductionStatus(
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

        const order = req.models.order.removeOrderItem(
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

        if (error.message.includes("cannot be modified")) {
            return res.status(400).json({
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

        const order = req.models.order.recordItemPickup(
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
            error.message.includes("Pickup quantity") ||
            error.message.includes("cannot be modified")
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

router.put(
    "/orders/:id/customer-here",
    (req, res) => {
        try {
            const orderId = Number(req.params.id);
            const { customer_here } = req.body;

            if (
                !Number.isInteger(orderId) ||
                orderId <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid order ID."
                });
            }

            if (
                typeof customer_here !== "boolean"
            ) {
                return res.status(400).json({
                    success: false,
                    error:
                        "customer_here must be true or false."
                });
            }

            const order =
                req.models.order.updateCustomerHere(
                    orderId,
                    customer_here
                );

            res.json({
                success: true,
                data: order
            });

        } catch (error) {

            console.error(
                "PUT /api/orders/:id/customer-here error:",
                error
            );

            if (
                error.message.includes("not found") ||
                error.message.includes("only available")
            ) {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }

            res.status(500).json({
                success: false,
                error:
                    "Failed to update customer arrival."
            });
        }
    }
);

router.put("/orders/:id/pickup-ready", (req, res) => {
    try {
        const orderId = Number(req.params.id);
        const { pickup_ready } = req.body;

        if (!Number.isInteger(orderId) || orderId <= 0) {
            return res.status(400).json({
                success: false,
                error: "Invalid order ID."
            });
        }

        if (typeof pickup_ready !== "boolean") {
            return res.status(400).json({
                success: false,
                error: "pickup_ready must be true or false."
            });
        }

        const order = req.models.order.updatePickupReady(
            orderId,
            pickup_ready
        );

        res.json({
            success: true,
            data: order
        });

    } catch (error) {

        console.error(
            "PUT /api/orders/:id/pickup-ready error:",
            error
        );

        if (
            error.message.includes("not found") ||
            error.message.includes("only available for preorders")
        ) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: "Failed to update pickup readiness."
        });
    }
});

router.post(
    "/orders/:id/items/:itemId/set-aside",
    (req, res) => {
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
                    error: "Set aside quantity must be greater than zero."
                });
            }

            const order = req.models.order.recordItemSetAside(
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
                "POST /api/orders/:id/items/:itemId/set-aside error:",
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
                error.message.includes("Set aside quantity") ||
                error.message.includes("remaining quantity") ||
                error.message.includes("cannot be modified")
            ) {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }

            res.status(500).json({
                success: false,
                error: "Failed to set aside item."
            });
        }
    }
);

router.get("/orders/:id/set-asides", (req, res) => {
    try {
        const orderId = Number(req.params.id);

        if (!Number.isInteger(orderId) || orderId <= 0) {
            return res.status(400).json({
                success: false,
                error: "Invalid order ID."
            });
        }

        const setAsides =
            req.models.order.getSetAsideHistory(orderId);

        res.json({
            success: true,
            data: setAsides
        });

    } catch (error) {
        console.error(
            "GET /api/orders/:id/set-asides error:",
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
            error: "Failed to retrieve set-aside history."
        });
    }
});

router.put(
    "/orders/:id/items/:itemId/decorator-priority",
    (req, res) => {
        try {
            const orderId = Number(req.params.id);
            const itemId = Number(req.params.itemId);

            const {
                priority
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

            if (priority !== 0 && priority !== 1) {
                return res.status(400).json({
                    success: false,
                    error: "Decorator priority must be 0 or 1."
                });
            }

            const order =
                req.models.order.updateOrderItemDecoratorPriority(
                    orderId,
                    itemId,
                    priority
                );

            res.json({
                success: true,
                data: order
            });

        } catch (error) {
            console.error(
                "PUT /api/orders/:id/items/:itemId/decorator-priority error:",
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
                error.message.includes("Decorator priority") ||
                error.message.includes("cannot be modified")
            ) {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }

            res.status(500).json({
                success: false,
                error: "Failed to update decorator priority."
            });
        }
    }
);

router.get("/orders/:id/pickups", (req, res) => {
    try {
        const orderId = Number(req.params.id);

        if (!Number.isInteger(orderId) || orderId <= 0) {
            return res.status(400).json({
                success: false,
                error: "Invalid order ID."
            });
        }

        const pickups = req.models.order.getPickupHistory(orderId);

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

        const order = req.models.order.updateOrderStatus(
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
            cash_received,
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

        const result = req.models.order.recordPayment({
            orderId,
            amount,
            paymentMethod: payment_method,
            cashReceived: cash_received,
            reference,
            recordedBy:
                req.mode === "TRAINING"
                    ? 1
                    : req.user.id,
            notes
        });

        res.status(201).json({
            success: true,
            data: result.order,
            change: result.change
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
            error.message.includes("Payment exceeds") ||
            error.message.includes("Cash received") ||
            error.message.includes("Bank transfer must pay the full remaining balance") ||
            error.message.includes("cannot be modified")
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

        const payments = req.models.order.getPaymentHistory(orderId);

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