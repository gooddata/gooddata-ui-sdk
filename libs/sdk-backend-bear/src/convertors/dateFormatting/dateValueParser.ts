// (C) 2020 GoodData Corporation
import parse from "date-fns/parse";
import { UnexpectedError } from "@gooddata/sdk-backend-spi";

export const dateFormats = ["MM/dd/yyyy", "dd/MM/yyyy", "dd-MM-yyyy", "yyyy-MM-dd", "M/d/yy", "dd.MM.yyyy"];
export type DateFormat = typeof dateFormats[number];
export const DEFAULT_DATE_FORMAT: DateFormat = "MM/dd/yyyy";

/**
 * Parses a string representation of a date of a given date format to a Date object.
 * @param value - value to parse.
 * @param dateFormat - dateFormat to assume when parsing the value.
 * @internal
 */
export const parseDateValue = (value: string, dateFormat: DateFormat = DEFAULT_DATE_FORMAT): Date => {
    if (!dateFormats.includes(dateFormat)) {
        throw new UnexpectedError(
            `Unsupported date format "${dateFormat}". Supported date formats are ${dateFormats}`,
        );
    }
    return parse(value, dateFormat, new Date());
};
