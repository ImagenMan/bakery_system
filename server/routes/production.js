const express = require("express");
const router = express.Router();

const { requireAdmin } = require("../middleware/auth");

const productionItem = require("../models/productionItem");

// =========================================================
// Production Items
// =========================================================

router.get("/items", (req, res) => {
    try {
        const result =
            productionItem.getActiveProductionItems();

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
            productionItem.getProductionItemById(id);

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
            productionItem.getProductionItemByProductId(
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
            base_batch_quantity
        } = req.body;

        const item =
            productionItem.updateProductionItem({
                id,
                base_batch_quantity
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
            productionItem.setProductionItemActive({
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
// Production Plans
// =========================================================

const productionPlan = require("../models/productionPlan");


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
            productionPlan.getProductionPlansByDate(date);

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
            productionPlan.getProductionPlanById(id);

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
                productionPlan.getProductionPlansByItem(
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
                productionPlan.getProductionPlanByItemAndDate(
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
            productionPlan.createProductionPlan({
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


router.put("/plans/:id", requireAdmin, (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                error: "Invalid production plan ID."
            });
        }

        const {
            production_date,
            planned_quantity
        } = req.body;

        const plan =
            productionPlan.updateProductionPlan({
                id,
                production_date,
                planned_quantity
            });

        res.json({
            success: true,
            data: plan
        });

    } catch (error) {
        console.error(
            "PUT /api/production/plans/:id error:",
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

const productionOutput = require("../models/productionOutput");


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
            productionOutput.getProductionOutputById(id);

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
                productionOutput.getProductionOutputsByPlanId(
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
                productionOutput.getProductionTotals(
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
                produced_quantity,
                finished_quantity = 0
            } = req.body;

            if (!Number.isInteger(planId) || planId <= 0) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid production plan ID."
                });
            }

            const output =
                productionOutput.createProductionOutput({
                    production_plan_id: planId,
                    produced_quantity,
                    finished_quantity
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

            if (
                error.message.includes("required") ||
                error.message.includes("valid") ||
                error.message.includes("positive") ||
                error.message.includes("non-negative") ||
                error.message.includes("cannot exceed") ||
                error.message.includes("not found")
            ) {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }

            res.status(500).json({
                success: false,
                error: "Failed to record production output."
            });
        }
    }
);

// =========================================================
// Production Supply
// =========================================================

const productionSupply = require("../models/productionSupply");


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
            productionSupply.updateProductionSupply({
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
            productionSupply.getProductionSupplyByDate(date);

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
                productionSupply.getProductionSupplyByItemAndDate(
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
            productionSupply.createProductionSupply({
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
            error: "Failed to create production supply."
        });
    }
});

module.exports = router;