function createDailyRecordModel(db) {

    function isValidRecordDate(value) {
        if (typeof value !== "string") {
            return false;
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return false;
        }

        const [year, month, day] =
            value.split("-").map(Number);

        const date =
            new Date(Date.UTC(year, month - 1, day));

        return (
            date.getUTCFullYear() === year &&
            date.getUTCMonth() === month - 1 &&
            date.getUTCDate() === day
        );
    }

    function validateRecordDate(record_date) {
        if (!isValidRecordDate(record_date)) {
            throw new Error(
                "Record date must be a valid date in YYYY-MM-DD format."
            );
        }
    }

    function getDailyRecordByDate(record_date) {
        validateRecordDate(record_date);

        return db.prepare(`
            SELECT
                id,
                record_date,
                opened_at,
                closed_at,
                weather_high,
                weather_low,
                rain_amount,
                electricity_reading,
                gas_reading,
                notes,
                created_at,
                updated_at
            FROM daily_records
            WHERE record_date = ?
        `).get(record_date);
    }

    function findDailyRecordByDate(record_date) {
        const record =
            getDailyRecordByDate(record_date);

        if (!record) {
            throw new Error(
                `Daily record for ${record_date} not found.`
            );
        }

        return record;
    }

    function createDailyRecord(record_date) {
        validateRecordDate(record_date);

        try {
            const result = db.prepare(`
                INSERT INTO daily_records (
                    record_date
                )
                VALUES (?)
            `).run(record_date);

            return findDailyRecordByDate(record_date);

        } catch (error) {
            if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
                throw new Error(
                    "A daily record already exists for this date."
                );
            }

            throw error;
        }
    }

    return {
        isValidRecordDate,
        getDailyRecordByDate,
        findDailyRecordByDate,
        createDailyRecord
    };
}

const db = require("../config/database");

module.exports = createDailyRecordModel(db);
module.exports.createDailyRecordModel = createDailyRecordModel;
