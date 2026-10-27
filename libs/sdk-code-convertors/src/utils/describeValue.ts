// (C) 2026 GoodData Corporation

const maxDescriptionLength = 80;

function asJson(value: unknown): string {
    // JSON writes NaN and Infinity as null.
    if (typeof value === "number" && !Number.isFinite(value)) {
        return String(value);
    }
    try {
        return JSON.stringify(value) ?? typeof value;
    } catch {
        // JSON has no BigInt, and an object that refers to itself cannot be written out.
        return typeof value === "bigint" ? "a bigint" : "an object";
    }
}

/**
 * Described as validatePublisherEntityV2 describes a value, so the number 2 and the string "2" read apart.
 *
 * @internal
 */
export function describeValue(value: unknown): string {
    const description = value === null ? "null" : Array.isArray(value) ? "an array" : asJson(value);
    return description.length > maxDescriptionLength
        ? `${description.slice(0, maxDescriptionLength - 1)}…`
        : description;
}
