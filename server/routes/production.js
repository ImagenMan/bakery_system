const express = require("express");
const router = express.Router();

const { requireAdmin } = require("../middleware/auth");


// =========================================================
// Production Items
// =========================================================

router.get("/items", (req, res) => {
    try {
        const result =
            req.models.productionItem.getActiveProductionItems();

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error(
            "GET /api/production/items error:",
            error
        );

        res.status(500).json({
            success: false,
            error: "Failed to retrieve production items."
        });
    }
});


router.get("/items/:id", (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                error: "Invalid production item ID."
            });
        }

        const item =
            req.models.productionItem.getProductionItemById(id);

        if (!item) {
            return res.status(404).json({
                success: false,
                error: "Production item not found."
            });
        }

        res.json({
            success: true,
            data: item
        });

    } catch (error) {
        console.error(
            "GET /api/production/items/:id error:",
            error
        );

        res.status(500).json({
            success: false,
            error: "Failed to retrieve production item."
        });
    }
});


router.get("/items/product/:productId", (req, res) => {
    try {
        const productId = Number(req.params.productId);

        if (!Number.isInteger(productId) || productId <= 0) {
            return res.status(400).json({
                success: false,
                error: "Invalid product ID."
            });
        }

        const item =
            req.models.productionItem.getProductionItemByProductId(
                productId
            );

        if (!item) {
            return res.status(404).json({
                success: false,
                error: "Production item not found."
            });
        }

        res.json({
            success: true,
            data: item
        });

    } catch (error) {
        console.error(
            "GET /api/production/items/product/:productId error:",
            error
        );

        res.status(500).json({
            success: false,
            error: "Failed to retrieve production item."
        });
    }
});

router.put("/items/:id", requireAdmin, (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                error: "Invalid production item ID."
            });
        }

        const {
            base_batch_quantity,
            inventory_behavior
        } = req.body;

        const item =
            req.models.productionItem.updateProductionItem({
                id,
                base_batch_quantity,
                inventory_behavior
            });

        res.json({
            success: true,
            data: item
        });

    } catch (error) {
        console.error(
            "PUT /api/production/items/:id error:",
            error
        );

        if (
            error.message.includes("required") ||
            error.message.includes("valid") ||
            error.message.includes("positive") ||
            error.message.includes("not found")
        ) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: "Failed to update production item."
        });
    }
});

router.patch("/items/:id/active", requireAdmin, (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                error: "Invalid production item ID."
            });
        }

        const { active } = req.body;

        const item =
            req.models.productionItem.setProductionItemActive({
                id,
                active
            });

        res.json({
            success: true,
            data: item
        });

    } catch (error) {
        console.error(
            "PATCH /api/production/items/:id/active error:",
            error
        );

        if (
            error.message.includes("not found") ||
            error.message.includes("Active")
        ) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: "Failed to update production item status."
        });
    }
});

// =========================================================
// Production Item <-> Product Mappings
// =========================================================


router.get(
    "/mappings/item/:productionItemId",
    (req, res) => {
        try {
            const productionItemId =
                Number(req.params.productionItemId);

            if (
                !Number.isInteger(productionItemId) ||
                productionItemId <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid production item ID."
                });
            }

            const result =
                req.models.productionItemProductMapping
                    .getMappingsByProductionItem(productionItemId);

            res.json({
                success: true,
                data: result
            });

        } catch (error) {
            console.error(
                "GET /api/production/mappings/item/:productionItemId error:",
                error
            );

            res.status(500).json({
                success: false,
                error: "Failed to retrieve mappings."
            });
        }
    }
);


router.get(
    "/mappings/product/:productId",
    (req, res) => {
        try {
            const productId = Number(req.params.productId);

            if (!Number.isInteger(productId) || productId <= 0) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid product ID."
                });
            }

            const mapping =
                req.models.productionItemProductMapping
                    .getMappingByProductId(productId);

            if (!mapping) {
                return res.status(404).json({
                    success: false,
                    error: "Mapping not found."
                });
            }

            res.json({
                success: true,
                data: mapping
            });

        } catch (error) {
            console.error(
                "GET /api/production/mappings/product/:productId error:",
                error
            );

            res.status(500).json({
                success: false,
                error: "Failed to retrieve mapping."
            });
        }
    }
);


// Note: mapping creation/update/deletion is intentionally not
// exposed over HTTP yet. Real mappings will be introduced via a
// dedicated data migration once the business relationships are
// confirmed (see mission notes); until then these are managed at
// the model/DB layer only. Read-only lookups remain available so
// once mappings exist, callers can inspect them.


// =========================================================
// Production Plans
// =========================================================



router.get("/plans", (req, res) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                error: "Production date is required."
            });
        }

        const result =
            req.models.productionPlan.getProductionPlansByDate(date);

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error(
            "GET /api/production/plans error:",
            error
        );

        if (error.message.includes("valid date")) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: "Failed to retrieve production plans."
        });
    }
});


router.get("/plans/:id", (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                error: "Invalid production plan ID."
            });
        }

        const plan =
            req.models.productionPlan.getProductionPlanById(id);

        if (!plan) {
            return res.status(404).json({
                success: false,
                error: "Production plan not found."
            });
        }

        res.json({
            success: true,
            data: plan
        });

    } catch (error) {
        console.error(
            "GET /api/production/plans/:id error:",
            error
        );

        res.status(500).json({
            success: false,
            error: "Failed to retrieve production plan."
        });
    }
});


router.get(
    "/plans/item/:productionItemId",
    (req, res) => {
        try {
            const productionItemId =
                Number(req.params.productionItemId);

            if (
                !Number.isInteger(productionItemId) ||
                productionItemId <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid production item ID."
                });
            }

            const result =
                req.models.productionPlan.getProductionPlansByItem(
                    productionItemId
                );

            res.json({
                success: true,
                data: result
            });

        } catch (error) {
            console.error(
                "GET /api/production/plans/item/:productionItemId error:",
                error
            );

            res.status(500).json({
                success: false,
                error: "Failed to retrieve production plans."
            });
        }
    }
);


router.get(
    "/plans/item/:productionItemId/date/:date",
    (req, res) => {
        try {
            const productionItemId =
                Number(req.params.productionItemId);

            const {
                date
            } = req.params;

            if (
                !Number.isInteger(productionItemId) ||
                productionItemId <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid production item ID."
                });
            }

            const plan =
                req.models.productionPlan.getProductionPlanByItemAndDate(
                    productionItemId,
                    date
                );

            if (!plan) {
                return res.status(404).json({
                    success: false,
                    error: "Production plan not found."
                });
            }

            res.json({
                success: true,
                data: plan
            });

        } catch (error) {
            console.error(
                "GET /api/production/plans/item/:productionItemId/date/:date error:",
                error
            );

            if (error.message.includes("valid date")) {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }

            res.status(500).json({
                success: false,
                error: "Failed to retrieve production plan."
            });
        }
    }
);


router.post("/plans", requireAdmin, (req, res) => {
    try {
        const {
            production_item_id,
            production_date,
            planned_quantity
        } = req.body;

        const plan =
            req.models.productionPlan.createProductionPlan({
                production_item_id,
                production_date,
                planned_quantity
            });

        res.status(201).json({
            success: true,
            data: plan
        });

    } catch (error) {
        console.error(
            "POST /api/production/plans error:",
            error
        );

        if (
            error.message.includes("required") ||
            error.message.includes("valid") ||
            error.message.includes("positive") ||
            error.message.includes("not found") ||
            error.message.includes("inactive") ||
            error.message.includes("already exists")
        ) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: "Failed to create production plan."
        });
    }
});

router.get("/demand", (req, res) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                error: "Production date is required."
            });
        }

        const result =
            req.models.productionPlan.getProductionDemandByDate(date);

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error(
            "GET /api/production/demand error:",
            error
        );

        if (
            error.message.includes("required") ||
            error.message.includes("valid date")
        ) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: "Failed to retrieve production demand."
        });
    }
});

router.get("/demand/unmapped", (req, res) => {
    try {
        const { date } = req.query;

        const result =
            req.models.productionPlan.getUnmappedProductionDemand(
                date
            );

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error(
            "GET /api/production/demand/unmapped error:",
            error
        );

        if (error.message.includes("valid date")) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: "Failed to retrieve unmapped production demand."
        });
    }
});

router.get("/overview", (req, res) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                error: "Production date is required."
            });
        }

        const result =
            req.models.productionPlan.getProductionOverviewByDate(date);

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error(
            "GET /api/production/overview error:",
            error
        );

        if (error.message.includes("valid date")) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: "Failed to retrieve production overview."
        });
    }
});

router.put("/plans/:id", requireAdmin, (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                error: "Invalid production plan ID."
            });
        }

        const updateData = {
            id
        };

        if (req.body.production_date !== undefined) {
            updateData.production_date = req.body.production_date;
        }

        if (req.body.planned_quantity !== undefined) {
            updateData.planned_quantity = req.body.planned_quantity;
        }

        const plan =
            req.models.productionPlan.updateProductionPlan(updateData);

        res.json({
            success: true,
            data: plan
        });

    } catch (error) {
        console.error(
            "PUT /api/production/plans/:id error:",
            error
        );

        if (error.message.includes("not found")) {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }

        if (
            error.message.includes("required") ||
            error.message.includes("valid") ||
            error.message.includes("positive") ||
            error.message.includes("already exists") ||
            error.message.includes("cannot be less") ||
            error.message.includes("cannot be changed")
        ) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: "Failed to update production plan."
        });
    }
});

// =========================================================
// Production Outputs
// =========================================================



router.get("/outputs/:id", (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                error: "Invalid production output ID."
            });
        }

        const output =
            req.models.productionOutput.getProductionOutputById(id);

        if (!output) {
            return res.status(404).json({
                success: false,
                error: "Production output not found."
            });
        }

        res.json({
            success: true,
            data: output
        });

    } catch (error) {
        console.error(
            "GET /api/production/outputs/:id error:",
            error
        );

        res.status(500).json({
            success: false,
            error: "Failed to retrieve production output."
        });
    }
});


router.get(
    "/plans/:planId/outputs",
    (req, res) => {
        try {
            const planId =
                Number(req.params.planId);

            if (!Number.isInteger(planId) || planId <= 0) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid production plan ID."
                });
            }

            const result =
                req.models.productionOutput.getProductionOutputsByPlanId(
                    planId
                );

            res.json({
                success: true,
                data: result
            });

        } catch (error) {
            console.error(
                "GET /api/production/plans/:planId/outputs error:",
                error
            );

            if (error.message.includes("not found")) {
                return res.status(404).json({
                    success: false,
                    error: error.message
                });
            }

            if (
                error.message.includes("required") ||
                error.message.includes("valid")
            ) {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }

            res.status(500).json({
                success: false,
                error: "Failed to retrieve production outputs."
            });
        }
    }
);


router.get(
    "/plans/:planId/totals",
    (req, res) => {
        try {
            const planId =
                Number(req.params.planId);

            if (!Number.isInteger(planId) || planId <= 0) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid production plan ID."
                });
            }

            const totals =
                req.models.productionOutput.getProductionTotals(
                    planId
                );

            res.json({
                success: true,
                data: totals
            });

        } catch (error) {
            console.error(
                "GET /api/production/plans/:planId/totals error:",
                error
            );

            if (error.message.includes("not found")) {
                return res.status(404).json({
                    success: false,
                    error: error.message
                });
            }

            if (
                error.message.includes("required") ||
                error.message.includes("valid")
            ) {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }

            res.status(500).json({
                success: false,
                error: "Failed to retrieve production totals."
            });
        }
    }
);


router.post(
    "/plans/:planId/outputs",
    (req, res) => {
        try {
            const planId =
                Number(req.params.planId);

            const {
                produced_quantity
            } = req.body;

            if (!Number.isInteger(planId) || planId <= 0) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid production plan ID."
                });
            }

            const output =
                req.models.productionOutput.createProductionOutput({
                    production_plan_id: planId,
                    produced_quantity
                });

            res.status(201).json({
                success: true,
                data: output
            });

        } catch (error) {
            console.error(
                "POST /api/production/plans/:planId/outputs error:",
                error
            );

            if (error.message.includes("not found")) {
                return res.status(404).json({
                    success: false,
                    error: error.message
                });
            }

            if (
                error.message.includes("required") ||
                error.message.includes("valid") ||
                error.message.includes("positive")
            ) {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }

            res.status(500).json({
                success: false,
                error: "Failed to create production output."
            });
        }
    }
);

// =========================================================
// Production Available
// =========================================================

router.get(
    "/plans/:planId/available",
    (req, res) => {
        try {
            const planId =
                Number(req.params.planId);

            if (!Number.isInteger(planId) || planId <= 0) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid production plan ID."
                });
            }

            const entries =
                req.models.productionAvailable
                    .getProductionAvailableByPlanId(
                        planId
                    );

            const totalAvailable =
                req.models.productionAvailable
                    .getAvailableTotal(
                        planId
                    );

            res.json({
                success: true,
                data: {
                    total_available: totalAvailable,
                    entries
                }
            });

        } catch (error) {
            console.error(
                "GET /api/production/plans/:planId/available error:",
                error
            );

            if (error.message.includes("not found")) {
                return res.status(404).json({
                    success: false,
                    error: error.message
                });
            }

            if (
                error.message.includes("required") ||
                error.message.includes("valid")
            ) {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }

            res.status(500).json({
                success: false,
                error:
                    "Failed to retrieve production available records."
            });
        }
    }
);


router.post(
    "/plans/:planId/available",
    (req, res) => {
        try {
            const planId =
                Number(req.params.planId);

            const {
                available_quantity
            } = req.body;

            if (!Number.isInteger(planId) || planId <= 0) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid production plan ID."
                });
            }

            const available =
                req.models.productionAvailable
                    .createProductionAvailable({
                        production_plan_id: planId,
                        available_quantity
                    });

            res.status(201).json({
                success: true,
                data: available
            });

        } catch (error) {
            console.error(
                "POST /api/production/plans/:planId/available error:",
                error
            );

            if (error.message.includes("not found")) {
                return res.status(404).json({
                    success: false,
                    error: error.message
                });
            }

            if (
                error.message.includes("required") ||
                error.message.includes("valid") ||
                error.message.includes("positive") ||
                error.message.includes("cannot exceed")
            ) {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }

            res.status(500).json({
                success: false,
                error:
                    "Failed to create production available record."
            });
        }
    }
);

// =========================================================
// Frozen Inventory
// =========================================================

router.post(
    "/available/:availableId/freeze",
    (req, res) => {
        try {
            const availableId =
                Number(req.params.availableId);

            const {
                quantity
            } = req.body;

            if (!Number.isInteger(availableId) || availableId <= 0) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid production available ID."
                });
            }

            const frozen =
                req.models.frozenInventory.createFrozenInventory({
                    source_production_available_id: availableId,
                    quantity
                });

            res.status(201).json({
                success: true,
                data: frozen
            });

        } catch (error) {
            console.error(
                "POST /api/production/available/:availableId/freeze error:",
                error
            );

            if (error.message.includes("not found")) {
                return res.status(404).json({
                    success: false,
                    error: error.message
                });
            }

            if (
                error.message.includes("required") ||
                error.message.includes("valid") ||
                error.message.includes("positive") ||
                error.message.includes("cannot exceed") ||
                error.message.includes("Only CARRY_FORWARD") ||
                error.message.includes("does not belong")
            ) {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }

            res.status(500).json({
                success: false,
                error: "Failed to freeze inventory."
            });
        }
    }
);

// =========================================================
// Production Supply
// =========================================================



router.put("/supply/:id", requireAdmin, (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                error: "Invalid production supply ID."
            });
        }

        const {
            quantity,
            supply_date
        } = req.body;

        const supply =
            req.models.productionSupply.updateProductionSupply({
                id,
                quantity,
                supply_date
            });

        res.json({
            success: true,
            data: supply
        });

    } catch (error) {
        console.error(
            "PUT /api/production/supply/:id error:",
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
            error.message.includes("required") ||
            error.message.includes("valid") ||
            error.message.includes("positive") ||
            error.message.includes("already exists")
        ) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: "Failed to update production supply."
        });
    }
});


router.get("/supply", (req, res) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                error: "Supply date is required."
            });
        }

        const result =
            req.models.productionSupply.getProductionSupplyByDate(date);

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error(
            "GET /api/production/supply error:",
            error
        );

        if (error.message.includes("valid date")) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: "Failed to retrieve production supply."
        });
    }
});


router.get(
    "/supply/item/:productionItemId/date/:date",
    (req, res) => {
        try {
            const productionItemId =
                Number(req.params.productionItemId);

            const {
                date
            } = req.params;

            if (
                !Number.isInteger(productionItemId) ||
                productionItemId <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid production item ID."
                });
            }

            const supply =
                req.models.productionSupply.getProductionSupplyByItemAndDate(
                    productionItemId,
                    date
                );

            if (!supply) {
                return res.status(404).json({
                    success: false,
                    error: "Production supply not found."
                });
            }

            res.json({
                success: true,
                data: supply
            });

        } catch (error) {
            console.error(
                "GET /api/production/supply/item/:productionItemId/date/:date error:",
                error
            );

            if (error.message.includes("valid date")) {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }

            res.status(500).json({
                success: false,
                error: "Failed to retrieve production supply."
            });
        }
    }
);


router.post("/supply", requireAdmin, (req, res) => {
    try {
        const {
            production_item_id,
            quantity,
            supply_date
        } = req.body;

        const supply =
            req.models.productionSupply.createProductionSupply({
                production_item_id,
                quantity,
                supply_date
            });

        res.status(201).json({
            success: true,
            data: supply
        });

    } catch (error) {
        console.error(
            "POST /api/production/supply error:",
            error
        );

        if (error.message.includes("not found")) {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }

        if (
            error.message.includes("required") ||
            error.message.includes("valid") ||
            error.message.includes("positive") ||
            error.message.includes("inactive") ||
            error.message.includes("already exists")
        ) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: "Failed to create production supply."
        });
    }
});

module.exports = router;