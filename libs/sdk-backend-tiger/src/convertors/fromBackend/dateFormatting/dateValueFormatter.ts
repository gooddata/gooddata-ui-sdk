// (C) 2020-2022 GoodData Corporation
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
