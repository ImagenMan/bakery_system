const { productionDb, trainingDb } = require("./context");
const { getBusinessDate } = require("../utils/businessTime");

const HISTORY_EVENT_TYPES = Object.freeze({
    ORDER_CREATED: "ORDER_CREATED",
    PAYMENT_RECEIVED: "PAYMENT_RECEIVED",
    PICKUP_RECORDED: "PICKUP_RECORDED",
    SET_ASIDE_RECORDED: "SET_ASIDE_RECORDED",

    PRODUCTION_PLANNED: "PRODUCTION_PLANNED",
    PRODUCTION_OUTPUT: "PRODUCTION_OUTPUT",
    PRODUCTION_AVAILABLE: "PRODUCTION_AVAILABLE",
    PRODUCTION_SUPPLY: "PRODUCTION_SUPPLY",

    INVENTORY_RECEIPT: "INVENTORY_RECEIPT",
    INVENTORY_CONSUMPTION: "INVENTORY_CONSUMPTION",
    INVENTORY_WASTE: "INVENTORY_WASTE",
    INVENTORY_FREEZE: "INVENTORY_FREEZE",
    INVENTORY_RELEASE: "INVENTORY_RELEASE",
    INVENTORY_FROZEN_WASTE: "INVENTORY_FROZEN_WASTE",

    LOGIN: "LOGIN",
    LOGOUT: "LOGOUT",
    BUSINESS_DAY_OPENED: "BUSINESS_DAY_OPENED",
    BUSINESS_DAY_CLOSED: "BUSINESS_DAY_CLOSED",
    BUSINESS_DAY_REOPENED: "BUSINESS_DAY_REOPENED",
    PRODUCTION_DAY_CLOSED: "PRODUCTION_DAY_CLOSED",
    POWER_OUTAGE: "POWER_OUTAGE",
    EQUIPMENT_ISSUE: "EQUIPMENT_ISSUE",
    OTHER: "OTHER",
});

function getHistoryEventBusinessDate(eventAt) {
    if (!eventAt) {
        return null;
    }

    return getBusinessDate(new Date(`${eventAt.replace(" ", "T")}Z`));
}

function createHistoryEvent({
    event_at,
    event_type,
    source_type,
    source_id,
    business_date = null,
    production_date = null,
    reference_type = null,
    reference_id = null,
    user_id = null,
    user_name = null,
    customer_id = null,
    customer_name = null,
    order_id = null,
    order_number = null,
    production_item_id = null,
    production_item_name = null,
    quantity = null,
    amount = null,
    payment_method = null,
    summary = null,
    notes = null,
    details = null,
}) {
    return {
        event_at,
        business_date:
            business_date || getHistoryEventBusinessDate(event_at),
        production_date,
        event_type,
        source_type,
        source_id,
        reference_type,
        reference_id,
        user_id,
        user_name,
        customer_id,
        customer_name,
        order_id,
        order_number,
        production_item_id,
        production_item_name,
        quantity,
        amount,
        payment_method,
        summary,
        notes,
        details,
    };
}

function getOperationalEvents(db, startDate, endDate) {
    const rows = db.prepare(`
        SELECT
            oe.id,
            oe.event_at,
            oe.event_type,
            oe.user_id,
            u.username AS user_name,
            oe.daily_record_id,
            oe.notes
        FROM operational_events oe
        LEFT JOIN users u
            ON u.id = oe.user_id
        WHERE
            oe.event_at >= ?
            AND oe.event_at < ?
        ORDER BY
            oe.event_at ASC,
            oe.id ASC
    `).all(startDate, endDate);

    return rows.map((row) =>
        createHistoryEvent({
            event_at: row.event_at,
            event_type: row.event_type,
            source_type: "operational_events",
            source_id: row.id,
            user_id: row.user_id,
            user_name: row.user_name,
            summary: row.event_type,
            notes: row.notes,
            details: {
                daily_record_id: row.daily_record_id,
            },
        })
    );
}

function getOrderEvents(db, startDate, endDate) {
    const rows = db.prepare(`
        SELECT
            o.id,
            o.created_at,
            o.order_number,
            o.order_type,
            o.customer_id,
            c.name AS customer_name,
            o.total_amount,
            o.amount_paid,
            o.status,
            o.payment_status,
            o.created_by,
            u.username AS user_name
        FROM orders o
        LEFT JOIN customers c
            ON c.id = o.customer_id
        LEFT JOIN users u
            ON u.id = o.created_by
        WHERE
            o.created_at >= ?
            AND o.created_at < ?
        ORDER BY
            o.created_at ASC,
            o.id ASC
    `).all(startDate, endDate);

    return rows.map((row) =>
        createHistoryEvent({
            event_at: row.created_at,
            event_type: "ORDER_CREATED",
            source_type: "orders",
            source_id: row.id,
            user_id: row.created_by,
            user_name: row.user_name,
            customer_id: row.customer_id,
            customer_name: row.customer_name,
            order_id: row.id,
            order_number: row.order_number,
            amount: Number(row.total_amount),
            summary:
                row.order_type === "COUNTER_SALE"
                    ? `Counter sale ${row.order_number}`
                    : `Preorder ${row.order_number}`,
            details: {
                order_type: row.order_type,
                status: row.status,
                payment_status: row.payment_status,
                amount_paid: Number(row.amount_paid),
            },
        })
    );
}

function getPaymentEvents(db, startDate, endDate) {
    const rows = db.prepare(`
        SELECT
            p.id,
            p.created_at,
            p.order_id,
            p.amount,
            p.payment_method,
            p.reference,
            p.recorded_by,
            u.username AS user_name,
            o.order_number
        FROM payments p
        JOIN orders o
            ON o.id = p.order_id
        LEFT JOIN users u
            ON u.id = p.recorded_by
        WHERE
            p.created_at >= ?
            AND p.created_at < ?
        ORDER BY
            p.created_at ASC,
            p.id ASC
    `).all(startDate, endDate);

    return rows.map((row) =>
        createHistoryEvent({
            event_at: row.created_at,
            event_type: "PAYMENT_RECEIVED",
            source_type: "payments",
            source_id: row.id,
            user_id: row.recorded_by,
            user_name: row.user_name,
            order_id: row.order_id,
            order_number: row.order_number,
            amount: Number(row.amount),
            payment_method: row.payment_method,
            summary: `Payment for ${row.order_number}`,
            details: {
                reference: row.reference,
            },
        })
    );
}

function getPickupEvents(db, startDate, endDate) {
    const rows = db.prepare(`
        SELECT
            p.id,
            p.picked_up_at,
            p.order_item_id,
            p.quantity,
            p.picked_up_by,
            p.notes,
            o.id AS order_id,
            o.order_number,
            oi.product_id,
            pr.name AS product_name,
            o.customer_id,
            c.name AS customer_name
        FROM order_item_pickups p
        JOIN order_items oi
            ON oi.id = p.order_item_id
        JOIN orders o
            ON o.id = oi.order_id
        LEFT JOIN products pr
            ON pr.id = oi.product_id
        LEFT JOIN customers c
            ON c.id = o.customer_id
        WHERE
            p.picked_up_at >= ?
            AND p.picked_up_at < ?
        ORDER BY
            p.picked_up_at ASC,
            p.id ASC
    `).all(startDate, endDate);

    return rows.map((row) =>
        createHistoryEvent({
            event_at: row.picked_up_at,
            event_type: "PICKUP_RECORDED",
            source_type: "order_item_pickups",
            source_id: row.id,
            customer_id: row.customer_id,
            customer_name: row.customer_name,
            order_id: row.order_id,
            order_number: row.order_number,
            production_item_id: null,
            production_item_name: row.product_name,
            quantity: Number(row.quantity),
            summary: `Pickup ${row.order_number}`,
            notes: row.notes,
            details: {
                order_item_id: row.order_item_id,
                product_id: row.product_id,
                picked_up_by: row.picked_up_by,
            },
        })
    );
}

function getSetAsideEvents(db, startDate, endDate) {
    const rows = db.prepare(`
        SELECT
            s.id,
            s.set_aside_at,
            s.order_item_id,
            s.quantity,
            s.set_aside_by,
            s.notes,
            o.id AS order_id,
            o.order_number,
            oi.product_id,
            pr.name AS product_name,
            o.customer_id,
            c.name AS customer_name
        FROM order_item_set_asides s
        JOIN order_items oi
            ON oi.id = s.order_item_id
        JOIN orders o
            ON o.id = oi.order_id
        LEFT JOIN products pr
            ON pr.id = oi.product_id
        LEFT JOIN customers c
            ON c.id = o.customer_id
        WHERE
            s.set_aside_at >= ?
            AND s.set_aside_at < ?
        ORDER BY
            s.set_aside_at ASC,
            s.id ASC
    `).all(startDate, endDate);

    return rows.map((row) =>
        createHistoryEvent({
            event_at: row.set_aside_at,
            event_type: "SET_ASIDE_RECORDED",
            source_type: "order_item_set_asides",
            source_id: row.id,
            customer_id: row.customer_id,
            customer_name: row.customer_name,
            order_id: row.order_id,
            order_number: row.order_number,
            production_item_name: row.product_name,
            quantity: Number(row.quantity),
            summary: `Set aside ${row.order_number}`,
            notes: row.notes,
            details: {
                order_item_id: row.order_item_id,
                product_id: row.product_id,
                set_aside_by: row.set_aside_by,
            },
        })
    );
}

function getProductionPlanEvents(db, startDate, endDate) {
    const rows = db.prepare(`
        SELECT
            pp.id,
            pp.created_at,
            pp.production_date,
            pp.planned_quantity,
            pi.id AS production_item_id,
            p.name AS production_item_name
        FROM production_plans pp
        JOIN production_items pi
            ON pi.id = pp.production_item_id
        JOIN products p
            ON p.id = pi.product_id
        WHERE
            pp.created_at >= ?
            AND pp.created_at < ?
        ORDER BY
            pp.created_at ASC,
            pp.id ASC
    `).all(startDate, endDate);

    return rows.map((row) =>
        createHistoryEvent({
            event_at: row.created_at,
            event_type: "PRODUCTION_PLANNED",
            source_type: "production_plans",
            source_id: row.id,
            production_date: row.production_date,
            production_item_id: row.production_item_id,
            production_item_name: row.production_item_name,
            quantity: Number(row.planned_quantity),
            summary: `Production planned: ${row.production_item_name}`,
            details: {
                planned_quantity: Number(row.planned_quantity),
            },
        })
    );
}

function getProductionOutputEvents(db, startDate, endDate) {
    const rows = db.prepare(`
        SELECT
            po.id,
            po.created_at,
            po.produced_quantity,
            pp.id AS production_plan_id,
            pp.production_date,
            pi.id AS production_item_id,
            p.name AS production_item_name
        FROM production_outputs po
        JOIN production_plans pp
            ON pp.id = po.production_plan_id
        JOIN production_items pi
            ON pi.id = pp.production_item_id
        JOIN products p
            ON p.id = pi.product_id
        WHERE
            po.created_at >= ?
            AND po.created_at < ?
        ORDER BY
            po.created_at ASC,
            po.id ASC
    `).all(startDate, endDate);

    return rows.map((row) =>
        createHistoryEvent({
            event_at: row.created_at,
            event_type: "PRODUCTION_OUTPUT",
            source_type: "production_outputs",
            source_id: row.id,
            production_date: row.production_date,
            production_item_id: row.production_item_id,
            production_item_name: row.production_item_name,
            quantity: Number(row.produced_quantity),
            summary: `Production output: ${row.production_item_name}`,
            details: {
                production_plan_id: row.production_plan_id,
            },
        })
    );
}

function getProductionAvailableEvents(db, startDate, endDate) {
    const rows = db.prepare(`
        SELECT
            pa.id,
            pa.created_at,
            pa.available_quantity,
            pp.id AS production_plan_id,
            pp.production_date,
            pi.id AS production_item_id,
            p.name AS production_item_name
        FROM production_available pa
        JOIN production_plans pp
            ON pp.id = pa.production_plan_id
        JOIN production_items pi
            ON pi.id = pp.production_item_id
        JOIN products p
            ON p.id = pi.product_id
        WHERE
            pa.created_at >= ?
            AND pa.created_at < ?
        ORDER BY
            pa.created_at ASC,
            pa.id ASC
    `).all(startDate, endDate);

    return rows.map((row) =>
        createHistoryEvent({
            event_at: row.created_at,
            event_type: "PRODUCTION_AVAILABLE",
            source_type: "production_available",
            source_id: row.id,
            production_date: row.production_date,
            production_item_id: row.production_item_id,
            production_item_name: row.production_item_name,
            quantity: Number(row.available_quantity),
            summary: `Production available: ${row.production_item_name}`,
            details: {
                production_plan_id: row.production_plan_id,
            },
        })
    );
}

function getProductionSupplyEvents(db, startDate, endDate) {
    const rows = db.prepare(`
        SELECT
            ps.id,
            ps.created_at,
            ps.supply_date,
            ps.quantity,
            pi.id AS production_item_id,
            p.name AS production_item_name
        FROM production_supply ps
        JOIN production_items pi
            ON pi.id = ps.production_item_id
        JOIN products p
            ON p.id = pi.product_id
        WHERE
            ps.created_at >= ?
            AND ps.created_at < ?
        ORDER BY
            ps.created_at ASC,
            ps.id ASC
    `).all(startDate, endDate);

    return rows.map((row) =>
        createHistoryEvent({
            event_at: row.created_at,
            event_type: "PRODUCTION_SUPPLY",
            source_type: "production_supply",
            source_id: row.id,
            production_date: row.supply_date,
            production_item_id: row.production_item_id,
            production_item_name: row.production_item_name,
            quantity: Number(row.quantity),
            summary: `Production supply: ${row.production_item_name}`,
        })
    );
}

function getInventoryEvents(db, startDate, endDate) {
    const rows = db.prepare(`
        SELECT
            it.id,
            it.created_at,
            it.production_item_id,
            p.name AS production_item_name,
            it.quantity_delta,
            it.transaction_type,
            it.reference_type,
            it.reference_id,
            it.source_production_available_id,
            iw.state AS waste_state,
            iw.reason AS waste_reason,
            iw.notes AS waste_notes
        FROM inventory_transactions it
        JOIN production_items pi
            ON pi.id = it.production_item_id
        JOIN products p
            ON p.id = pi.product_id
        LEFT JOIN inventory_waste iw
            ON iw.inventory_transaction_id = it.id
        WHERE
            it.created_at >= ?
            AND it.created_at < ?
        ORDER BY
            it.created_at ASC,
            it.id ASC
    `).all(startDate, endDate);

    return rows.map((row) => {
        let eventType = "INVENTORY_RECEIPT";

        if (row.transaction_type === "CONSUMPTION") {
            eventType = "INVENTORY_CONSUMPTION";
        } else if (row.transaction_type === "WASTE") {
            eventType = "INVENTORY_WASTE";
        }

        return createHistoryEvent({
            event_at: row.created_at,
            event_type: eventType,
            source_type: "inventory_transactions",
            source_id: row.id,
            reference_type: row.reference_type,
            reference_id: row.reference_id,
            production_item_id: row.production_item_id,
            production_item_name: row.production_item_name,
            quantity: Number(row.quantity_delta),
            summary: `${row.transaction_type}: ${row.production_item_name}`,
            details: {
                source_production_available_id:
                    row.source_production_available_id,
                waste_state: row.waste_state,
                waste_reason: row.waste_reason,
                waste_notes: row.waste_notes,
            },
        });
    });
}

function getFrozenInventoryEvents(db, startDate, endDate) {
    const rows = db.prepare(`
        SELECT
            fi.id,
            fi.created_at,
            fi.production_item_id,
            p.name AS production_item_name,
            fi.source_production_plan_id,
            fi.source_production_available_id,
            fi.quantity,
            fi.action_type,
            fi.inventory_transaction_id
        FROM frozen_inventory fi
        JOIN production_items pi
            ON pi.id = fi.production_item_id
        JOIN products p
            ON p.id = pi.product_id
        WHERE
            fi.created_at >= ?
            AND fi.created_at < ?
        ORDER BY
            fi.created_at ASC,
            fi.id ASC
    `).all(startDate, endDate);

    return rows.map((row) => {
        let eventType = "INVENTORY_FREEZE";

        if (row.action_type === "RELEASE") {
            eventType = "INVENTORY_RELEASE";
        } else if (row.action_type === "WASTE") {
            eventType = "INVENTORY_FROZEN_WASTE";
        }

        return createHistoryEvent({
            event_at: row.created_at,
            event_type: eventType,
            source_type: "frozen_inventory",
            source_id: row.id,
            production_item_id: row.production_item_id,
            production_item_name: row.production_item_name,
            quantity: Number(row.quantity),
            summary: `${row.action_type}: ${row.production_item_name}`,
            details: {
                source_production_plan_id: row.source_production_plan_id,
                source_production_available_id:
                    row.source_production_available_id,
                inventory_transaction_id: row.inventory_transaction_id,
            },
        });
    });
}

function getHistory({
    mode = "normal",
    startDate,
    endDate,
}) {
    if (!startDate || !endDate) {
        throw new Error("startDate and endDate are required");
    }

    if (startDate >= endDate) {
        throw new Error("startDate must be before endDate");
    }

    const db =
        mode === "training"
            ? trainingDb
            : productionDb;

    const events = [
        ...getOperationalEvents(db, startDate, endDate),
        ...getOrderEvents(db, startDate, endDate),
        ...getPaymentEvents(db, startDate, endDate),
        ...getPickupEvents(db, startDate, endDate),
        ...getSetAsideEvents(db, startDate, endDate),
        ...getProductionPlanEvents(db, startDate, endDate),
        ...getProductionOutputEvents(db, startDate, endDate),
        ...getProductionAvailableEvents(db, startDate, endDate),
        ...getProductionSupplyEvents(db, startDate, endDate),
        ...getInventoryEvents(db, startDate, endDate),
        ...getFrozenInventoryEvents(db, startDate, endDate),
    ];

    events.sort((a, b) => {
        if (a.event_at < b.event_at) {
            return -1;
        }

        if (a.event_at > b.event_at) {
            return 1;
        }

        if (a.source_type < b.source_type) {
            return -1;
        }

        if (a.source_type > b.source_type) {
            return 1;
        }

        return Number(a.source_id) - Number(b.source_id);
    });

    return events;
}

function calculateHistoryDashboard(events) {
    if (!Array.isArray(events)) {
        throw new Error("events must be an array");
    }

    const validOrders = events.filter(
        (event) =>
            event.event_type === "ORDER_CREATED" &&
            event.details?.status !== "CANCELLED"
    );

    const counterSales = validOrders.filter(
        (event) =>
            event.details?.order_type === "COUNTER_SALE" &&
            event.details?.status === "COMPLETED"
    );

    const payments = events.filter(
        (event) =>
            event.event_type === "PAYMENT_RECEIVED"
    );

    const production = events.filter(
        (event) =>
            event.event_type === "PRODUCTION_OUTPUT"
    );

    const pickups = events.filter(
        (event) =>
            event.event_type === "PICKUP_RECORDED"
    );

    const waste = events.filter(
        (event) =>
            event.event_type === "INVENTORY_WASTE"
    );

    const orderValue = validOrders.reduce(
        (total, event) =>
            total + (Number(event.amount) || 0),
        0
    );

    const paymentTotal = payments.reduce(
        (total, event) =>
            total + (Number(event.amount) || 0),
        0
    );

    const productionQuantity = production.reduce(
        (total, event) =>
            total + (Number(event.quantity) || 0),
        0
    );

    const wasteQuantity = waste.reduce(
        (total, event) =>
            total + Math.abs(Number(event.quantity) || 0),
        0
    );

    const paymentByMethod = {};

    for (const event of payments) {
        const method = event.payment_method || "UNKNOWN";

        paymentByMethod[method] =
            (paymentByMethod[method] || 0) +
            (Number(event.amount) || 0);
    }

    const businessDayEvents = events
        .filter(
            (event) =>
                event.event_type === "BUSINESS_DAY_OPENED" ||
                event.event_type === "BUSINESS_DAY_CLOSED" ||
                event.event_type === "BUSINESS_DAY_REOPENED"
        )
        .sort((a, b) => {
            if (a.event_at < b.event_at) {
                return -1;
            }

            if (a.event_at > b.event_at) {
                return 1;
            }

            return Number(a.source_id) - Number(b.source_id);
        });

    const latestBusinessDayEvent =
        businessDayEvents.length > 0
            ? businessDayEvents[businessDayEvents.length - 1]
            : null;

    const productionDayClosedEvent =
        events
            .filter(
                (event) =>
                    event.event_type === "PRODUCTION_DAY_CLOSED"
            )
            .sort((a, b) => {
                if (a.event_at < b.event_at) {
                    return -1;
                }

                if (a.event_at > b.event_at) {
                    return 1;
                }

                return Number(a.source_id) - Number(b.source_id);
            })
            .at(-1) || null;

    let businessDayStatus = "NOT_OPENED";
    let openedAt = null;
    let closedAt = null;

    for (const event of businessDayEvents) {
        if (
            event.event_type === "BUSINESS_DAY_OPENED" ||
            event.event_type === "BUSINESS_DAY_REOPENED"
        ) {
            businessDayStatus = "OPEN";
            openedAt = event.event_at;
            closedAt = null;
        } else if (
            event.event_type === "BUSINESS_DAY_CLOSED"
        ) {
            businessDayStatus = "CLOSED";
            closedAt = event.event_at;
        }
    }

    return {
        orders: {
            count: validOrders.length,
            order_value: orderValue,
        },

        counter_sales: {
            count: counterSales.length,
            order_value: counterSales.reduce(
                (total, event) =>
                    total + (Number(event.amount) || 0),
                0
            ),
        },

        pickups: {
            count: pickups.length,
        },

        production: {
            quantity: productionQuantity,
        },

        waste: {
            quantity: wasteQuantity,
        },

        payments: {
            total_amount: paymentTotal,
            transaction_count: payments.length,
            by_method: paymentByMethod,
        },

        business_day: {
            status: businessDayStatus,
            opened_at: openedAt,
            production_day_closed_at:
                productionDayClosedEvent
                    ? productionDayClosedEvent.event_at
                    : null,
            closed_at: closedAt,
        },
    };
}

module.exports = {
    HISTORY_EVENT_TYPES,
    getHistory,
    calculateHistoryDashboard,
};
