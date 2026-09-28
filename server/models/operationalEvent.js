function createOperationalEventModel(db) {

    const EVENT_TYPES = [
        "LOGIN",
        "LOGOUT",
        "BUSINESS_DAY_OPENED",
        "BUSINESS_DAY_CLOSED",
        "BUSINESS_DAY_REOPENED",
        "PRODUCTION_DAY_CLOSED",
        "POWER_OUTAGE",
        "EQUIPMENT_ISSUE",
        "OTHER"
    ];

    function isValidEventType(value) {
        return EVENT_TYPES.includes(value);
    }

    function validateEventType(event_type) {
        if (!isValidEventType(event_type)) {
            throw new Error(
                "Event type must be a valid operational event type."
            );
        }
    }

    function isValidEventAt(value) {
        if (typeof value !== "string") {
            return false;
        }

        if (
            !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(
                value
            )
        ) {
            return false;
        }

        const [
            datePart,
            timePart
        ] = value.split(" ");

        const [
            year,
            month,
            day
        ] = datePart.split("-").map(Number);

        const [
            hour,
            minute,
            second
        ] = timePart.split(":").map(Number);

        const date =
            new Date(
                Date.UTC(
                    year,
                    month - 1,
                    day,
                    hour,
                    minute,
                    second
                )
            );

        return (
            date.getUTCFullYear() === year &&
            date.getUTCMonth() === month - 1 &&
            date.getUTCDate() === day &&
            date.getUTCHours() === hour &&
            date.getUTCMinutes() === minute &&
            date.getUTCSeconds() === second
        );
    }

    function validateEventAt(event_at) {
        if (!isValidEventAt(event_at)) {
            throw new Error(
                "Event time must be a valid UTC timestamp in YYYY-MM-DD HH:MM:SS format."
            );
        }
    }

    function validateUserId(user_id) {
        if (user_id === null || user_id === undefined) {
            return;
        }

        if (
            !Number.isInteger(user_id) ||
            user_id <= 0
        ) {
            throw new Error(
                "User ID must be a positive integer."
            );
        }
    }

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

    function getOperationalEventById(id) {
        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {
            throw new Error(
                "Operational event ID must be a positive integer."
            );
        }

        return db.prepare(`
            SELECT
                id,
                event_type,
                event_at,
                daily_record_id,
                user_id,
                notes,
                created_at
            FROM operational_events
            WHERE id = ?
        `).get(id);
    }

    function findOperationalEventById(id) {
        const event =
            getOperationalEventById(id);

        if (!event) {
            throw new Error(
                `Operational event ${id} not found.`
            );
        }

        return event;
    }

    function createOperationalEvent({
        event_type,
        event_at,
        daily_record_id,
        user_id = null,
        notes = null
    }) {
        validateEventType(event_type);
        validateEventAt(event_at);
        validateDailyRecordId(daily_record_id);
        validateUserId(user_id);

        const result = db.prepare(`
            INSERT INTO operational_events (
                event_type,
                event_at,
                daily_record_id,
                user_id,
                notes
            )
            VALUES (?, ?, ?, ?, ?)
        `).run(
            event_type,
            event_at,
            daily_record_id,
            user_id,
            notes
        );

        return findOperationalEventById(result.lastInsertRowid);
    }

    function getBusinessDayOpeningEvent(daily_record_id) {
        validateDailyRecordId(daily_record_id);

        return db.prepare(`
            SELECT
                id,
                event_type,
                event_at,
                daily_record_id,
                user_id,
                notes,
                created_at
            FROM operational_events
            WHERE daily_record_id = ?
              AND event_type = 'BUSINESS_DAY_OPENED'
        `).get(daily_record_id);
    }

    function openBusinessDay({
        daily_record_id,
        event_at,
        user_id = null,
        notes = null
    }) {
        validateDailyRecordId(daily_record_id);
        validateEventAt(event_at);
        validateUserId(user_id);

        const existingEvent = db.prepare(`
            SELECT
                id,
                event_type,
                event_at,
                daily_record_id,
                user_id,
                notes,
                created_at
            FROM operational_events
            WHERE daily_record_id = ?
              AND event_type = 'BUSINESS_DAY_OPENED'
        `).get(daily_record_id);

        if (existingEvent) {
            return existingEvent;
        }

        const result = db.prepare(`
            INSERT INTO operational_events (
                event_type,
                event_at,
                daily_record_id,
                user_id,
                notes
            )
            VALUES (?, ?, ?, ?, ?)
        `).run(
            "BUSINESS_DAY_OPENED",
            event_at,
            daily_record_id,
            user_id,
            notes
        );

        return findOperationalEventById(result.lastInsertRowid);
    }

    function closeBusinessDay({
        daily_record_id,
        event_at,
        user_id = null,
        notes = null
    }) {
        validateDailyRecordId(daily_record_id);
        validateEventAt(event_at);
        validateUserId(user_id);

        const existingEvent = db.prepare(`
            SELECT
                id,
                event_type,
                event_at,
                daily_record_id,
                user_id,
                notes,
                created_at
            FROM operational_events
            WHERE daily_record_id = ?
              AND event_type = 'BUSINESS_DAY_CLOSED'
        `).get(daily_record_id);

        if (existingEvent) {
            return existingEvent;
        }

        const result = db.prepare(`
            INSERT INTO operational_events (
                event_type,
                event_at,
                daily_record_id,
                user_id,
                notes
            )
            VALUES (?, ?, ?, ?, ?)
        `).run(
            "BUSINESS_DAY_CLOSED",
            event_at,
            daily_record_id,
            user_id,
            notes
        );

        return findOperationalEventById(result.lastInsertRowid);
    }

    function isProductionDayClosed(production_date) {
        if (
            typeof production_date !== "string" ||
            !/^\d{4}-\d{2}-\d{2}$/.test(production_date)
        ) {
            throw new Error(
                "Production date must be a valid date in YYYY-MM-DD format."
            );
        }

        return Boolean(db.prepare(`
            SELECT oe.id
            FROM operational_events oe
            JOIN daily_records dr
                ON oe.daily_record_id = dr.id
            WHERE dr.record_date = ?
              AND oe.event_type = 'PRODUCTION_DAY_CLOSED'
            LIMIT 1
        `).get(production_date));
    }

    function closeProductionDay({
        daily_record_id,
        event_at,
        user_id = null,
        notes = null
    }) {
        validateDailyRecordId(daily_record_id);
        validateEventAt(event_at);
        validateUserId(user_id);

        const existingEvent = db.prepare(`
            SELECT
                id,
                event_type,
                event_at,
                daily_record_id,
                user_id,
                notes,
                created_at
            FROM operational_events
            WHERE daily_record_id = ?
              AND event_type = 'PRODUCTION_DAY_CLOSED'
        `).get(daily_record_id);

        if (existingEvent) {
            return existingEvent;
        }

        const result = db.prepare(`
            INSERT INTO operational_events (
                event_type,
                event_at,
                daily_record_id,
                user_id,
                notes
            )
            VALUES (?, ?, ?, ?, ?)
        `).run(
            "PRODUCTION_DAY_CLOSED",
            event_at,
            daily_record_id,
            user_id,
            notes
        );

        return findOperationalEventById(result.lastInsertRowid);
    }

    return {
        EVENT_TYPES,
        isValidEventType,
        validateEventType,
        isValidEventAt,
        validateEventAt,
        validateUserId,
        validateDailyRecordId,
        getOperationalEventById,
        findOperationalEventById,
        createOperationalEvent,
        getBusinessDayOpeningEvent,
        openBusinessDay,
        closeBusinessDay,
        isProductionDayClosed,
        closeProductionDay
    };
}

const db = require("../config/database");

module.exports = createOperationalEventModel(db);
module.exports.createOperationalEventModel =
    createOperationalEventModel;
