const {
    getWeatherConfig
} = require("../../config/weather");

const WEATHER_REQUEST_TIMEOUT_MS =
    10000;

function validateRecordDate(record_date) {
    if (
        typeof record_date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(record_date)
    ) {
        throw new Error(
            "Record date must use YYYY-MM-DD format."
        );
    }

    const [year, month, day] =
        record_date.split("-").map(Number);

    const date =
        new Date(
            Date.UTC(
                year,
                month - 1,
                day
            )
        );

    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
    ) {
        throw new Error(
            "Record date must be a valid calendar date."
        );
    }
}

function normalizeNumber(value) {
    if (
        value === null ||
        value === undefined
    ) {
        return null;
    }

    const number =
        Number(value);

    if (!Number.isFinite(number)) {
        return null;
    }

    return number;
}

async function getHistoricalWeather(
    record_date
) {
    validateRecordDate(record_date);

    const config =
        getWeatherConfig();

    const location =
        `${config.latitude},${config.longitude}`;

    const elements = [
        "datetime",
        "tempmax",
        "tempmin",
        "precip",
        "preciptype"
    ].join(",");

    const url =
        new URL(
            `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}/${record_date}`
        );

    url.searchParams.set(
        "key",
        config.apiKey
    );

    url.searchParams.set(
        "unitGroup",
        "metric"
    );

    url.searchParams.set(
        "include",
        "days"
    );

    url.searchParams.set(
        "elements",
        elements
    );

    const response =
        await fetch(
            url,
            {
                signal:
                    AbortSignal.timeout(
                        WEATHER_REQUEST_TIMEOUT_MS
                    )
            }
        );

    if (!response.ok) {
        const body =
            await response.text();

        throw new Error(
            `Visual Crossing request failed (${response.status}): ${body.slice(0, 300)}`
        );
    }

    const data =
        await response.json();

    if (
        !data ||
        !Array.isArray(data.days) ||
        data.days.length === 0
    ) {
        throw new Error(
            `Visual Crossing returned no weather data for ${record_date}.`
        );
    }

    const day =
        data.days.find(
            (item) =>
                item &&
                item.datetime === record_date
        );

    if (!day) {
        throw new Error(
            `Visual Crossing did not return the requested date ${record_date}.`
        );
    }

    const precipitation =
        normalizeNumber(day.precip);

    let rain = null;

    if (
        Array.isArray(day.preciptype) &&
        day.preciptype.includes("rain")
    ) {
        rain = precipitation;
    } else if (
        precipitation !== null &&
        day.preciptype === undefined
    ) {
        rain = precipitation;
    }

    return {
        record_date,
        temperature_high:
            normalizeNumber(day.tempmax),
        temperature_low:
            normalizeNumber(day.tempmin),
        precipitation,
        rain,
        source:
            config.source,
        latitude:
            config.latitude,
        longitude:
            config.longitude
    };
}

module.exports = {
    getHistoricalWeather
};
