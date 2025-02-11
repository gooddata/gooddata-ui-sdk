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
export const toModifiedISOStringWithTimezone = (date: Date, timezone?: string) => {
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

        return toModifiedISOString(new Date(string));
    }
    return toModifiedISOString(date);
};

function getTimezoneOffsetInISOFormat(date: Date, timeZone: string) {
    const str = date.toLocaleString("en-US", { timeZone, timeZoneName: "longOffset" });
    const tmz = str.split(" ").pop() ?? "Z";
    return tmz.replace("GMT", "");
}
