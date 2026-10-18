const {
    getBusinessDate
} = require("../utils/businessTime");

function requireOpenBusinessDay(req, res, next) {
    try {
        const businessDate = getBusinessDate();

        const dailyRecord =
            req.models.dailyRecord.getDailyRecordByDate(
                businessDate
            );

        const openingEvent = dailyRecord
            ? req.models.operationalEvent
                .getActiveBusinessDayOpeningEvent(
                    dailyRecord.id
                )
            : null;

        if (
            !openingEvent ||
            dailyRecord.closed_at
        ) {
            return res.status(409).json({
                success: false,
                error:
                    `Business day for ${businessDate} must be open before operational actions can be changed.`
            });
        }

        next();

    } catch (error) {
        next(error);
    }
}

function requireOpenBusinessDayForPickup(req, res, next) {
    try {
        const orderId = Number(req.params.id);
        const itemId = Number(req.params.itemId);
        const { quantity, idempotencyKey } = req.body;

        if (
            req.models.order.hasMatchingPickupIdempotencyKey(
                orderId,
                itemId,
                quantity,
                idempotencyKey
            )
        ) {
            return next();
        }

        return requireOpenBusinessDay(req, res, next);

    } catch (error) {
        next(error);
    }
}

function requireOpenBusinessDayUnlessCancelled(
    req,
    res,
    next
) {
    if (req.body.status === "CANCELLED") {
        return next();
    }

    return requireOpenBusinessDay(req, res, next);
}

function requireOpenBusinessDayForCounterSalePayment(
    req,
    res,
    next
) {
    try {
        const orderId = Number(req.params.id);
        const order = req.models.order.getOrderById(orderId);

        // Let the existing route/model report missing orders.
        if (!order || order.order_type !== "COUNTER_SALE") {
            return next();
        }

        return requireOpenBusinessDay(req, res, next);

    } catch (error) {
        next(error);
    }
}

function requireOpenBusinessDayForCounterSaleMutation(
    req,
    res,
    next
) {
    try {
        const orderId = Number(req.params.id);
        const order = req.models.order.getOrderById(orderId);

        // Preserve existing handling for missing orders and preorders.
        if (!order || order.order_type !== "COUNTER_SALE") {
            return next();
        }

        return requireOpenBusinessDay(req, res, next);

    } catch (error) {
        next(error);
    }
}

module.exports = {
    requireOpenBusinessDay,
    requireOpenBusinessDayForPickup,
    requireOpenBusinessDayUnlessCancelled,
    requireOpenBusinessDayForCounterSalePayment,
    requireOpenBusinessDayForCounterSaleMutation
};
