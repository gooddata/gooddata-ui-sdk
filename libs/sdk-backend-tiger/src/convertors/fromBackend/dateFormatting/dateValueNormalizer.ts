// (C) 2020-2026 GoodData Corporation

import { parseDateValue } from "./dateValueParser.js";
import { type DateNormalizer } from "./types.js";

/**
 * Creates a function that takes a string date attribute value, granularity, locale and formatting pattern
 * and returns a formatted date string.
 * @public
 */
export function createDateValueNormalizer(): DateNormalizer {
    return (value, granularity, locale, timezone) => {
        if (value === null) {
            return "";
        }
        const parsed = parseDateValue(value, granularity, timezone, locale);
        // Guard values that cannot be represented as a Date (e.g. second-of-minute 60, minute-of-day 1440,
        // second-of-day 86400) — toISOString() would throw on an Invalid Date. Fall back to the raw value.
        if (Number.isNaN(parsed.getTime())) {
            return value;
        }
        return parsed.toISOString();
    };
}
