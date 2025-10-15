// (C) 2020-2025 GoodData Corporation

import { parseDateValue } from "./dateValueParser.js";
import { DateNormalizer } from "./types.js";

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
        return parseDateValue(value, granularity, timezone, locale).toISOString();
    };
}
