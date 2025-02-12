// (C) 2022-2025 GoodData Corporation

/**
 * In order to match backend format, we need to remove milliseconds from the date.
 * Otherwise comparing newly created dates (as ISO string) with ISO dates from backend will fail.
 */
export const toModifiedISOString = (date: Date) => {
    return date.toISOString().split(".")[0] + "Z";
};

/**
 * In order to match backend format, we need to remove milliseconds from the date and also convert it to UTC
 * based on the provided timezone.
 */
export const toModifiedISOStringToTimezone = (date: Date, timezone?: string) => {
    if (timezone) {
        const offset = getTimezoneOffsetInISOFormat(date, timezone);

        const stringDate = [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            date.getDate().toString().padStart(2, "0"),
        ].join("-");
        const stringTime = [
            date.getHours().toString().padStart(2, "0"),
            date.getMinutes().toString().padStart(2, "0"),
            date.getSeconds().toString().padStart(2, "0"),
        ].join(":");
        const string = `${stringDate}T${stringTime}${offset}`;
        const dateUpdated = new Date(string);

        return {
            date: dateUpdated,
            iso: toModifiedISOString(dateUpdated),
        };
    }
    return {
        date,
        iso: toModifiedISOString(date),
    };
};

export const toModifiedISOStringFromTimezone = (date: Date, fromTimezone: string, toTimezone?: string) => {
    if (fromTimezone && toTimezone) {
        const offsetFrom = getTimezoneOffset(date, fromTimezone);
        const offsetTo = getTimezoneOffset(date, toTimezone);
        const dateUpdated = new Date(date.getTime() + offsetFrom - offsetTo);

        return {
            date: dateUpdated,
            iso: toModifiedISOString(dateUpdated),
        };
    }
    return {
        date,
        iso: toModifiedISOString(date),
    };
};

function getTimezoneOffsetInISOFormat(date: Date, timeZone: string) {
    const str = date.toLocaleString("en-US", { timeZone, timeZoneName: "longOffset" });
    const tmz = str.split(" ").pop() ?? "Z";
    return tmz.replace("GMT", "");
}

function getTimezoneOffset(date: Date, timeZone: string) {
    const iso = getTimezoneOffsetInISOFormat(date, timeZone);

    if (iso === "Z" || !iso) {
        return 0;
    }

    const [hoursStr, minutesStr] = iso.split(":");

    const hours = parseInt(hoursStr);
    const minutes = parseInt(minutesStr);

    return (hours * 60 + minutes) * 60 * 1000;
}
