// (C) 2020-2024 GoodData Corporation
import { parseDateValue } from "./dateValueParser.js";
import { DateFormatter, DateParseFormatter } from "./types.js";

/**
 * Creates a function that takes a string date attribute value, granularity, locale and formatting pattern
 * and returns a formatted date string.
 * @param dateFormatter - function to use to format Date values to a string
 * @public
 */
export function createDateValueFormatter(dateFormatter: DateFormatter): DateParseFormatter {
    return (value, granularity, locale, pattern) => {
        if (value === null) {
            return "";
        }
        const parsed = parseDateValue(value, granularity);
        return dateFormatter(parsed, granularity, locale, pattern);
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
    return (value, granularity, locale, pattern) => {
        if (value === null) {
            return " - ";
        }
        return base(value, granularity, locale, pattern);
    };
}
