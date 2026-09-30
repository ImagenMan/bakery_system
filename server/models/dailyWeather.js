function createDailyWeatherModel(db) {

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

    function validateWeatherNumber(value, fieldName) {
        if (
            value !== null &&
            (
                typeof value !== "number" ||
                !Number.isFinite(value)
            )
        ) {
            throw new Error(
                `${fieldName} must be a valid number or null.`
            );
        }
    }

    function validateSource(source) {
        if (
            typeof source !== "string" ||
            !source.trim()
        ) {
            throw new Error(
                "Weather source is required."
            );
        }
    }

    function validateCoordinate(value, fieldName) {
        if (
            typeof value !== "number" ||
            !Number.isFinite(value)
        ) {
            throw new Error(
                `${fieldName} must be a valid number.`
            );
        }
    }

    function validateRetrievedAt(retrieved_at) {
        if (
            typeof retrieved_at !== "string" ||
            !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(
                retrieved_at
            )
        ) {
            throw new Error(
                "Retrieved time must use YYYY-MM-DD HH:MM:SS format."
            );
        }
    }

    function getWeatherByDailyRecordId(
        daily_record_id
    ) {
        validateDailyRecordId(daily_record_id);

        return db.prepare(`
            SELECT
                id,
                daily_record_id,
                temperature_high,
                temperature_low,
                precipitation,
                rain,
                source,
                latitude,
                longitude,
                retrieved_at,
                created_at,
                updated_at
            FROM daily_weather
            WHERE daily_record_id = ?
        `).get(daily_record_id);
    }

    function getWeatherByDate(record_date) {
        if (
            typeof record_date !== "string" ||
            !/^\d{4}-\d{2}-\d{2}$/.test(record_date)
        ) {
            throw new Error(
                "Record date must use YYYY-MM-DD format."
            );
        }

        return db.prepare(`
            SELECT
                dw.id,
                dw.daily_record_id,
                dw.temperature_high,
                dw.temperature_low,
                dw.precipitation,
                dw.rain,
                dw.source,
                dw.latitude,
                dw.longitude,
                dw.retrieved_at,
                dw.created_at,
                dw.updated_at
            FROM daily_weather dw
            INNER JOIN daily_records dr
                ON dr.id = dw.daily_record_id
            WHERE dr.record_date = ?
        `).get(record_date);
    }

    function saveWeather({
        daily_record_id,
        temperature_high = null,
        temperature_low = null,
        precipitation = null,
        rain = null,
        source,
        latitude,
        longitude,
        retrieved_at
    }) {
        validateDailyRecordId(daily_record_id);

        validateWeatherNumber(
            temperature_high,
            "Temperature high"
        );

        validateWeatherNumber(
            temperature_low,
            "Temperature low"
        );

        validateWeatherNumber(
            precipitation,
            "Precipitation"
        );

        validateWeatherNumber(
            rain,
            "Rain"
        );

        validateSource(source);

        validateCoordinate(
            latitude,
            "Latitude"
        );

        validateCoordinate(
            longitude,
            "Longitude"
        );

        validateRetrievedAt(retrieved_at);

        const dailyRecordExists =
            db.prepare(`
                SELECT
                    id
                FROM daily_records
                WHERE id = ?
            `).get(daily_record_id);

        if (!dailyRecordExists) {
            throw new Error(
                `Daily record ${daily_record_id} not found.`
            );
        }

        db.prepare(`
            INSERT INTO daily_weather (
                daily_record_id,
                temperature_high,
                temperature_low,
                precipitation,
                rain,
                source,
                latitude,
                longitude,
                retrieved_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(daily_record_id)
            DO UPDATE SET
                temperature_high =
                    excluded.temperature_high,
                temperature_low =
                    excluded.temperature_low,
                precipitation =
                    excluded.precipitation,
                rain =
                    excluded.rain,
                source =
                    excluded.source,
                latitude =
                    excluded.latitude,
                longitude =
                    excluded.longitude,
                retrieved_at =
                    excluded.retrieved_at,
                updated_at =
                    CURRENT_TIMESTAMP
        `).run(
            daily_record_id,
            temperature_high,
            temperature_low,
            precipitation,
            rain,
            source.trim(),
            latitude,
            longitude,
            retrieved_at
        );

        return getWeatherByDailyRecordId(
            daily_record_id
        );
    }

    return {
        getWeatherByDailyRecordId,
        getWeatherByDate,
        saveWeather
    };
}

const db = require("../config/database");

module.exports = createDailyWeatherModel(db);
module.exports.createDailyWeatherModel =
    createDailyWeatherModel;
