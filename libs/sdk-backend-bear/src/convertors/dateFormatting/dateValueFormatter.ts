// (C) 2020 GoodData Corporation
import { parseDateValue } from "./dateValueParser.js";
import { DateFormatter } from "./types.js";

/**
 * Creates a function that takes a string date attribute value and a targetDateFormat and returns a formatted date string in the target date format.
 * @param dateFormatter - function to use to format Date values to a string
 * @public
 */
export function createDateValueFormatter(dateFormatter: DateFormatter) {
    return (value: string): string => dateFormatter(parseDateValue(value));
}
