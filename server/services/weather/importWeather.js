const {
    getHistoricalWeather
} = require("./visualCrossing");

async function importWeatherForDailyRecord({
    dailyRecordId,
    recordDate,
    dailyWeather
}) {
    if (
        !Number.isInteger(dailyRecordId) ||
        dailyRecordId <= 0
    ) {
        throw new Error(
            "Daily record id must be a positive integer."
        );
    }

    if (
        typeof recordDate !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(recordDate)
    ) {
        throw new Error(
            "Record date must use YYYY-MM-DD format."
        );
    }

    if (
        !dailyWeather ||
        typeof dailyWeather.saveWeather !== "function"
    ) {
        throw new Error(
            "Daily weather model is required."
        );
    }

    const weather =
        await getHistoricalWeather(
            recordDate
        );

    return dailyWeather.saveWeather({
        daily_record_id:
            dailyRecordId,
        temperature_high:
            weather.temperature_high,
        temperature_low:
            weather.temperature_low,
        precipitation:
            weather.precipitation,
        rain:
            weather.rain,
        source:
            weather.source,
        latitude:
            weather.latitude,
        longitude:
            weather.longitude,
        retrieved_at:
            new Date()
                .toISOString()
                .slice(0, 19)
                .replace("T", " ")
    });
}

module.exports = {
    importWeatherForDailyRecord
};
