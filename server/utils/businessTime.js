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

function getBusinessDateUtcRange(recordDate) {
    if (
        typeof recordDate !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(recordDate)
    ) {
        throw new Error(
            "Business date must be in YYYY-MM-DD format."
        );
    }

    const [year, month, day] =
        recordDate.split("-").map(Number);

    const normalizedDate =
        new Date(
            Date.UTC(
                year,
                month - 1,
                day
            )
        );

    if (
        normalizedDate.getUTCFullYear() !== year ||
        normalizedDate.getUTCMonth() !== month - 1 ||
        normalizedDate.getUTCDate() !== day
    ) {
        throw new Error(
            "Business date must be a valid calendar date."
        );
    }

    const candidate =
        normalizedDate;

    const parts =
        new Intl.DateTimeFormat(
            "en-CA",
            {
                timeZone: BUSINESS_TIMEZONE,
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hourCycle: "h23"
            }
        ).formatToParts(candidate);

    const values = {};

    for (const part of parts) {
        if (part.type !== "literal") {
            values[part.type] = part.value;
        }
    }

    const localAsUtc =
        Date.UTC(
            Number(values.year),
            Number(values.month) - 1,
            Number(values.day),
            Number(values.hour),
            Number(values.minute),
            Number(values.second)
        );

    const offset =
        candidate.getTime() -
        localAsUtc;

    const start =
        new Date(
            candidate.getTime() + offset
        );

    const end =
        new Date(
            start.getTime() +
            24 * 60 * 60 * 1000
        );

    return {
        startDate:
            start.toISOString()
                .slice(0, 19)
                .replace("T", " "),
        endDate:
            end.toISOString()
                .slice(0, 19)
                .replace("T", " ")
    };
}

module.exports = {
    BUSINESS_TIMEZONE,
    getBusinessDate,
    getCurrentEventAt,
    getBusinessDateUtcRange
};
