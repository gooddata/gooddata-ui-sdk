// (C) 2020-2026 GoodData Corporation

import { invariant } from "ts-invariant";

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
 * Wraps a date value formatter so that it shows the raw values when their format cannot be applied.
 *
 * @remarks
 * Used for computed attributes, whose format is written by their author and can contain pattern tokens
 * the date formatter does not support, which would otherwise fail the whole result. Formats of date
 * attributes come from the backend, so a failure there is a bug that should not be hidden.
 *
 * The failure depends on the format only, so once it fails, the remaining values are shown raw without
 * formatting them again and the warning is logged only once.
 *
 * @param formatter - formatter of the date values, all of them with the same format
 * @param attribute - identifier of the attribute the values belong to, for the warning
 * @internal
 */
export function guardDateValueFormatter(
    formatter: DateParseFormatter,
    attribute: string,
): DateParseFormatter {
    let failed = false;

    return (value, granularity, locale, pattern, timezone) => {
        if (!failed) {
            try {
                return formatter(value, granularity, locale, pattern, timezone);
            } catch (error) {
                failed = true;
                invariant.warn(
                    `Unable to format values of the "${attribute}" attribute by the "${pattern}" pattern, showing raw values.`,
                    error,
                );
            }
        }

        return value ?? "";
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
