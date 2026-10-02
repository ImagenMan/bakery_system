function createDailyContextModel(db) {

    const CONTEXT_TYPES = [
        "HOLIDAY",
        "SCHOOL_VACATION",
        "LOCAL_EVENT",
        "PROMOTION",
        "OTHER"
    ];

    function validateDailyRecordId(daily_record_id) {
        if (
            !Number.isInteger(daily_record_id) ||
            daily_record_id <= 0
        ) {
            throw new Error(
                "Daily record ID must be a positive integer."
            );
        }
    }

    function validateContextType(context_type) {
        if (!CONTEXT_TYPES.includes(context_type)) {
            throw new Error(
                `Context type must be one of: ${CONTEXT_TYPES.join(", ")}.`
            );
        }
    }

    function validateTitle(title) {
        if (
            typeof title !== "string" ||
            !title.trim()
        ) {
            throw new Error(
                "Context title is required."
            );
        }
    }

    function validateId(id) {
        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {
            throw new Error(
                "Context ID must be a positive integer."
            );
        }
    }

    function getDailyContextById(id) {
        validateId(id);

        return db.prepare(`
            SELECT
                id,
                daily_record_id,
                context_type,
                title,
                notes,
                created_at,
                updated_at
            FROM daily_context
            WHERE id = ?
        `).get(id);
    }

    function findDailyContextById(id) {
        const context =
            getDailyContextById(id);

        if (!context) {
            throw new Error(
                `Daily context ${id} not found.`
            );
        }

        return context;
    }

    function getDailyContextsByDailyRecordId(
        daily_record_id
    ) {
        validateDailyRecordId(
            daily_record_id
        );

        return db.prepare(`
            SELECT
                id,
                daily_record_id,
                context_type,
                title,
                notes,
                created_at,
                updated_at
            FROM daily_context
            WHERE daily_record_id = ?
            ORDER BY id ASC
        `).all(daily_record_id);
    }

    function createDailyContext({
        daily_record_id,
        context_type,
        title,
        notes = null
    }) {
        validateDailyRecordId(
            daily_record_id
        );

        validateContextType(
            context_type
        );

        validateTitle(title);

        const result = db.prepare(`
            INSERT INTO daily_context (
                daily_record_id,
                context_type,
                title,
                notes
            )
            VALUES (?, ?, ?, ?)
        `).run(
            daily_record_id,
            context_type,
            title.trim(),
            notes
        );

        return findDailyContextById(
            result.lastInsertRowid
        );
    }

    function updateDailyContext({
        id,
        context_type,
        title,
        notes = null
    }) {
        validateId(id);

        validateContextType(
            context_type
        );

        validateTitle(title);

        const existingContext =
            findDailyContextById(id);

        db.prepare(`
            UPDATE daily_context
            SET
                context_type = ?,
                title = ?,
                notes = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            context_type,
            title.trim(),
            notes,
            existingContext.id
        );

        return findDailyContextById(id);
    }

    function deleteDailyContext(id) {
        validateId(id);

        const existingContext =
            findDailyContextById(id);

        db.prepare(`
            DELETE FROM daily_context
            WHERE id = ?
        `).run(existingContext.id);

        return existingContext;
    }

    return {
        CONTEXT_TYPES,
        validateDailyRecordId,
        validateContextType,
        validateTitle,
        getDailyContextById,
        findDailyContextById,
        getDailyContextsByDailyRecordId,
        createDailyContext,
        updateDailyContext,
        deleteDailyContext
    };
}

const db = require("../config/database");

module.exports = createDailyContextModel(db);
module.exports.createDailyContextModel =
    createDailyContextModel;
