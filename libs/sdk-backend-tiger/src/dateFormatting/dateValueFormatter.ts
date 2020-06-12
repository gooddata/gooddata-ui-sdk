// (C) 2020 GoodData Corporation
import { CatalogDateAttributeGranularity } from "@gooddata/sdk-model";
import { parseDateValue } from "./dateValueParser";
import { DateFormatter } from "./types";
import { createDefaultDateFormatter } from "./defaultDateFormatter";

/**
 * Creates a function that takes a string date attribute value and a granularity and returns a formatted date string.
 * @param dateFormatter - function to use to format Date values to a string
 * @public
 */
export function createDateValueFormatter(dateFormatter: DateFormatter = createDefaultDateFormatter()) {
    return (value: string, granularity: CatalogDateAttributeGranularity) => {
        const parsed = parseDateValue(value, granularity);
        return dateFormatter(parsed, granularity);
    };
}
