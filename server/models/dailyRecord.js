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
                staffing_notes,
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

    function openDailyRecord(record_date) {
        validateRecordDate(record_date);

        const existingRecord =
            getDailyRecordByDate(record_date);

        if (existingRecord) {
            if (existingRecord.closed_at !== null) {
                throw new Error(
                    `Daily record for ${record_date} is already closed.`
                );
            }

            if (existingRecord.opened_at !== null) {
                return existingRecord;
            }
        }

        if (!existingRecord) {
            createDailyRecord(record_date);
        }

        db.prepare(`
            UPDATE daily_records
            SET
                opened_at = COALESCE(opened_at, CURRENT_TIMESTAMP),
                updated_at = CURRENT_TIMESTAMP
            WHERE record_date = ?
        `).run(record_date);

        return findDailyRecordByDate(record_date);
    }

    function closeDailyRecord(record_date) {
        validateRecordDate(record_date);

        const record =
            findDailyRecordByDate(record_date);

        if (record.closed_at !== null) {
            throw new Error(
                `Daily record for ${record_date} is already closed.`
            );
        }

        if (record.opened_at === null) {
            throw new Error(
                `Daily record for ${record_date} has not been opened.`
            );
        }

        db.prepare(`
            UPDATE daily_records
            SET
                closed_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE record_date = ?
        `).run(record_date);

        return findDailyRecordByDate(record_date);
    }

    function reopenDailyRecord(record_date) {
        validateRecordDate(record_date);

        const record =
            findDailyRecordByDate(record_date);

        if (!record) {
            throw new Error(
                `No daily record exists for ${record_date}.`
            );
        }

        if (record.closed_at === null) {
            throw new Error(
                `Daily record for ${record_date} is not closed.`
            );
        }

        db.prepare(`
            UPDATE daily_records
            SET
                closed_at = NULL,
                updated_at = CURRENT_TIMESTAMP
            WHERE record_date = ?
        `).run(record_date);

        return findDailyRecordByDate(record_date);
    }

    function updateDailyRecord({
        record_date,
        electricity_reading,
        gas_reading,
        notes,
        staffing_notes
    }) {
        validateRecordDate(record_date);

        const record =
            findDailyRecordByDate(
                record_date
            );

        if (!record) {
            throw new Error(
                `No daily record exists for ${record_date}.`
            );
        }

        db.prepare(`
            UPDATE daily_records
            SET
                electricity_reading = ?,
                gas_reading = ?,
                notes = ?,
                staffing_notes = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE record_date = ?
        `).run(
            electricity_reading,
            gas_reading,
            notes,
            staffing_notes,
            record_date
        );

        return findDailyRecordByDate(
            record_date
        );
    }

    return {
        isValidRecordDate,
        getDailyRecordByDate,
        findDailyRecordByDate,
        createDailyRecord,
        openDailyRecord,
        closeDailyRecord,
        reopenDailyRecord,
        updateDailyRecord
    };
}

const db = require("../config/database");

module.exports = createDailyRecordModel(db);
module.exports.createDailyRecordModel = createDailyRecordModel;
