function createProductionDayModel({
    db,
    productionPlan,
    inventory,
    dailyRecord,
    operationalEvent
}) {
    function endProductionDay({
        production_date,
        event_at,
        user_id = null
    }) {
        if (!productionPlan.isValidProductionDate(production_date)) {
            throw new Error(
                "Production date must be a valid date in YYYY-MM-DD format."
            );
        }

        const transaction = db.transaction(() => {
            const record =
                dailyRecord.getDailyRecordByDate(production_date);

            if (!record) {
                throw new Error(
                    `No daily record exists for production date ${production_date}.`
                );
            }

            if (!record.opened_at) {
                throw new Error(
                    "Cannot close production for a daily record that has not been opened."
                );
            }

            // Check for an existing closure before checking business-day
            // closure. A retry must never record waste a second time.
            if (operationalEvent.isProductionDayClosed(production_date)) {
                return {
                    event: operationalEvent.closeProductionDay({
                        daily_record_id: record.id,
                        event_at,
                        user_id
                    }),
                    waste_transactions: [],
                    already_closed: true
                };
            }

            if (record.closed_at) {
                throw new Error(
                    "Cannot close production for a daily record that is already closed."
                );
            }

            const plans =
                productionPlan.getProductionPlansByDate(production_date);

            const wasteTransactions = [];

            for (const plan of plans) {
                const planWaste =
                    inventory.wasteRemainingFreshForProductionPlan({
                        production_plan_id: plan.id
                    });

                wasteTransactions.push(...planWaste);
            }

            const event =
                operationalEvent.closeProductionDay({
                    daily_record_id: record.id,
                    event_at,
                    user_id
                });

            return {
                event,
                waste_transactions: wasteTransactions,
                already_closed: false
            };
        });

        return transaction();
    }

    return {
        endProductionDay
    };
}

module.exports = {
    createProductionDayModel
};
