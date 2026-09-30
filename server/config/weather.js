const WEATHER_API_KEY =
    process.env.WEATHER_API_KEY ||
    null;

const WEATHER_LATITUDE =
    20.2961601;

const WEATHER_LONGITUDE =
    -103.2368295;

const WEATHER_SOURCE =
    "Visual Crossing";

function getWeatherConfig() {
    if (!WEATHER_API_KEY) {
        throw new Error(
            "WEATHER_API_KEY is not configured."
        );
    }

    return {
        apiKey: WEATHER_API_KEY,
        latitude: WEATHER_LATITUDE,
        longitude: WEATHER_LONGITUDE,
        source: WEATHER_SOURCE
    };
}

module.exports = {
    getWeatherConfig
};
