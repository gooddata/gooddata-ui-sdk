// (C) 2007-2020 GoodData Corporation
import { ISeparators } from "@gooddata/sdk-ui";
import { stripColors, numberFormat, containsNullConditionalFormat } from "@gooddata/numberjs";
import isNull from "lodash/isNull.js";

export const HYPHEN = "–"; // EN DASH (not usual 'minus')

export function formatMetric(
    number: string | number | null,
    format = "#,##0.00",
    separators: ISeparators | undefined,
): string {
    return numberFormat(isNull(number) ? "" : number, stripColors(format), undefined, separators);
}

export function isValueUnhandledNull(value: unknown, format: string): boolean {
    return isNull(value) && !containsNullConditionalFormat(format);
}
