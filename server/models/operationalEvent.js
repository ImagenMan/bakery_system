function createOperationalEventModel(db) {

    const EVENT_TYPES = [
        "LOGIN",
        "LOGOUT",
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
        user_id = null,
        notes = null
    }) {
        validateEventType(event_type);
        validateEventAt(event_at);
        validateUserId(user_id);

        const result = db.prepare(`
            INSERT INTO operational_events (
                event_type,
                event_at,
                user_id,
                notes
            )
            VALUES (?, ?, ?, ?)
        `).run(
            event_type,
            event_at,
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
        getOperationalEventById,
        findOperationalEventById,
        createOperationalEvent
    };
}

const db = require("../config/database");

module.exports = createOperationalEventModel(db);
module.exports.createOperationalEventModel =
    createOperationalEventModel;
