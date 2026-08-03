// (C) 2020-2026 GoodData Corporation

import { parseDateValue, serializeDateValue } from "./dateValueParser.js";
import { type DateFormatter, type DateParseFormatter, type DateStringifier } from "./types.js";

/**
 * Creates a function that takes a string date attribute value, granularity, locale and formatting pattern
 * and returns a formatted date string.
 * @param dateFormatter - function to use to format Date values to a string
 * @public
 */
export function createDateValueFormatter(dateFormatter: DateFormatter): DateParseFormatter {
    return (value, granularity, locale, pattern, timezone) => {
        if (value === null) {
            return "";
        }
        const parsed = parseDateValue(value, granularity, timezone, locale);
        // Some backend values cannot be represented as a Date and parse to an Invalid Date — e.g. the inclusive
        // upper bound / leap value of a generic granularity (second-of-minute 60, minute-of-day 1440,
        // second-of-day 86400). Show the raw value instead of letting date-fns throw so the result never fails.
        if (Number.isNaN(parsed.getTime())) {
            return value;
        }
        return dateFormatter(parsed, granularity, locale, pattern, timezone);
    };
}

/**
 * Creates a function that takes a Date object, granularity, locale and timezone
 * and returns a formatted date string
 * @public
 */
export function createDateValueStringifier(): DateStringifier {
    return (value, granularity, locale, timezone) => {
        return serializeDateValue(value, granularity, timezone, locale);
    };
}

/**
 * Creates a function that takes a string date attribute value, granularity, locale and formatting pattern
 * and returns a formatted date string. If the value is null, it returns " - ". This method is used for
 * formatting missing date values in the forecast.
 * @param dateFormatter - function to use to format Date values to a string
 * @internal
 */
export function createForecastDateValueFormatter(dateFormatter: DateFormatter): DateParseFormatter {
    const base = createDateValueFormatter(dateFormatter);
    return (value, granularity, locale, pattern, timezone) => {
        if (value === null) {
            return " - ";
        }
        return base(value, granularity, locale, pattern, timezone);
    };
}
