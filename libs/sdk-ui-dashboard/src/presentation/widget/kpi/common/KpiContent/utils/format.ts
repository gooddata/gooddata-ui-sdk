// (C) 2007-2020 GoodData Corporation
import { ISeparators } from "@gooddata/sdk-model";
import { ClientFormatterFacade } from "@gooddata/number-formatter";
import isNull from "lodash/isNull.js";

export const HYPHEN = "–"; // EN DASH (not usual 'minus')

export function formatMetric(
    number: string | number | null | undefined,
    format?: string,
    separators?: ISeparators,
): string {
    const convertedValue = ClientFormatterFacade.convertValue(number);

    const { formattedValue } = ClientFormatterFacade.formatValue(convertedValue, format, separators);

    return formattedValue;
}

export function isValueUnhandledNull(value: string | number | null | undefined, format: string): boolean {
    const convertedValue = ClientFormatterFacade.convertValue(value);
    const { nullConditionFormatter } = ClientFormatterFacade.formatValue(convertedValue, format);

    return isNull(value) && !nullConditionFormatter;
}
