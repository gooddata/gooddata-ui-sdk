// (C) 2025 GoodData Corporation

/**
 * Parse date from backend format to Date object.
 *
 * @param value - date in "yyyy-MM-dd HH:mm" format in UTC
 * @returns date in Date object
 */
export function parseBackendDate(value: string): Date | null {
    // Backend returns dates in the "yyyy-MM-dd HH:mm" format in UTC.
    // Therefore, it needs to be converted to ISO 8601 format.
    // NOTE: Eventually this should be already handled in the backend client.

    // Return null for any other format
    const backendFormatRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
    if (!backendFormatRegex.test(value)) {
        return null;
    }

    const isoString = value.replace(" ", "T") + "Z";
    const date = new Date(isoString);

    // Return null for invalid date
    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
}
