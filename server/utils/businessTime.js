const BUSINESS_TIMEZONE =
    "America/Mexico_City";

function getBusinessDate(date = new Date()) {
    const parts =
        new Intl.DateTimeFormat(
            "en-CA",
            {
                timeZone: BUSINESS_TIMEZONE,
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            }
        ).formatToParts(date);

    const values = {};

    for (const part of parts) {
        if (part.type !== "literal") {
            values[part.type] = part.value;
        }
    }

    return [
        values.year,
        values.month,
        values.day
    ].join("-");
}

function getCurrentEventAt(date = new Date()) {
    return (
        `${date.getUTCFullYear()}-` +
        `${String(date.getUTCMonth() + 1).padStart(2, "0")}-` +
        `${String(date.getUTCDate()).padStart(2, "0")} ` +
        `${String(date.getUTCHours()).padStart(2, "0")}:` +
        `${String(date.getUTCMinutes()).padStart(2, "0")}:` +
        `${String(date.getUTCSeconds()).padStart(2, "0")}`
    );
}

module.exports = {
    BUSINESS_TIMEZONE,
    getBusinessDate,
    getCurrentEventAt
};
